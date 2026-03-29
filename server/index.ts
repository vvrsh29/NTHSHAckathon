import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import type { ClientMessage, ServerMessage } from '../shared/types.js'
import { SSHManager } from './ssh-manager.js'
import { DirectPtyManager } from './direct-pty-manager.js'
import { StepEngine } from './step-engine.js'
import { MentorEngine } from './mentor-engine.js'
import { detectEnvironment } from './env-detector.js'
import { loadCourse } from './courses/course-loader.js'

config()

const anthropicKey = process.env.ANTHROPIC_API_KEY
if (!anthropicKey) {
  console.warn('[SERVER] ANTHROPIC_API_KEY not set — AI mentor will use fallback responses')
} else {
  console.log('[SERVER] Anthropic API key loaded')
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '3456', 10)
const SSH_PORT = parseInt(process.env.SSH_PORT || '2222', 10)
const PROJECT_DIR = process.env.PROJECT_DIR
  ? process.env.PROJECT_DIR.replace('~', process.env.HOME || '')
  : path.join(process.env.HOME || '', 'launchpad-projects')

// Ensure project dir exists
if (!fs.existsSync(PROJECT_DIR)) {
  fs.mkdirSync(PROJECT_DIR, { recursive: true })
}

// --- Shared SSH server (one PTY, shared across all WS clients) ---
const sshManager = new SSHManager(PROJECT_DIR)
sshManager.listen(SSH_PORT)

// --- Express app ---
const app = express()
app.use(express.json())

const clientDist = path.resolve(__dirname, '../dist/client')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, projectDir: PROJECT_DIR, sshPort: SSH_PORT })
})

app.get('/api/demo', (_req, res) => {
  res.json({
    description: 'Claude Code tutorial',
    hint: 'Learn to use Claude Code, Anthropic\'s AI coding assistant',
  })
})

app.get('/api/env', async (_req, res) => {
  try {
    const results = await detectEnvironment()
    res.json(results)
  } catch {
    res.status(500).json({ error: 'Environment detection failed' })
  }
})

// Catch-all: in dev redirect to Vite, in prod serve index.html
app.get('*', (_req, res) => {
  const indexHtml = path.join(clientDist, 'index.html')
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml)
  } else {
    res.redirect('http://localhost:5173')
  }
})

// --- WebSocket server ---
const server = createServer(app)
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://localhost:${PORT}`)
  if (url.pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function broadcast(msg: ServerMessage) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg))
    }
  })
}

// Forward SSH terminal output to all WS clients
sshManager.onOutput((data) => {
  broadcast({ type: 'terminal_output', data })
})

// Forward SSH connection status to all WS clients
sshManager.onStatus((connected) => {
  broadcast({ type: 'ssh_status', connected })
})

wss.on('connection', (ws: WebSocket) => {
  console.log('[SERVER] Client connected via WebSocket')

  // Send current SSH status immediately
  send(ws, { type: 'ssh_status', connected: sshManager.isConnected() })

  const mentor = new MentorEngine(ws)

  // Direct PTY for in-browser terminal
  const directPty = new DirectPtyManager((msg) => send(ws, msg))

  // Output provider — uses direct PTY if alive, otherwise SSH
  function getOutputProvider() {
    if (directPty.isAlive) return { getCleanOutput: (n: number) => directPty.getCleanOutput(n) }
    return { getCleanOutput: (n: number) => sshManager.getCleanOutput(n) }
  }

  const stepEngine = new StepEngine(
    ws,
    getOutputProvider(),
    (error, output) => {
      mentor.explainError(error, output)
      // Increment failure count for current step
      const state = stepEngine.getState()
      if (state.step) {
        stepEngine.incrementFailure(state.step.id)
        if (stepEngine.getFailureCount(state.step.id) >= 3) {
          send(ws, {
            type: 'mentor_message',
            messageType: 'error_help',
            content: 'Looks like this step is giving you trouble. Click **Auto-Fix** and I\'ll run the fix for you.',
          })
        }
      }
    },
    (phase) => {
      console.log('[SERVER] Phase complete:', phase)
    },
  )

  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'select_course': {
          ;(async () => {
            try {
              // Resolve project directory from client, with validation
              let resolvedProjectDir = PROJECT_DIR
              if (msg.projectDir && msg.projectDir.trim()) {
                let pd = msg.projectDir.trim()
                // Expand ~ to HOME
                if (pd.startsWith('~')) {
                  pd = pd.replace(/^~/, process.env.HOME || '')
                }
                // Block path traversal
                if (!pd.includes('..')) {
                  resolvedProjectDir = pd
                }
              }
              // Ensure project dir exists
              if (!fs.existsSync(resolvedProjectDir)) {
                fs.mkdirSync(resolvedProjectDir, { recursive: true })
              }

              const env = await detectEnvironment()
              send(ws, { type: 'env_detection', results: env })

              const phases = loadCourse(msg.level, env, msg.courseTopic)
              send(ws, { type: 'course_started', level: msg.level, phases })

              if (msg.apiKey) {
                process.env.ANTHROPIC_API_KEY = msg.apiKey
                mentor.refreshClient()
              }

              if (msg.userName) {
                mentor.setUserName(msg.userName)
              }

              // Spawn direct PTY for in-browser terminal
              if (!directPty.isAlive) {
                directPty.spawn(msg.apiKey)
              }

              // Update step engine's output provider to use direct PTY
              stepEngine.setOutputProvider(getOutputProvider())

              // Delay starting the course to let PTY initialize
              setTimeout(() => {
                stepEngine.startCourse(msg.level, phases)

                // Explain the first step — only for steps with a command
                const state = stepEngine.getState()
                if (state?.step?.command) {
                  mentor.explainStep(state.step, directPty.getCleanOutput(10))
                }
              }, 500)
            } catch (err) {
              console.error('[SERVER] Failed to start course:', err)
              send(ws, {
                type: 'mentor_message',
                messageType: 'error_help',
                content: 'Something went wrong starting the course. Please try again.',
              })
            }
          })()
          break
        }

        case 'set_api_key': {
          process.env.ANTHROPIC_API_KEY = msg.apiKey
          mentor.refreshClient()
          break
        }

        case 'pty_input': {
          directPty.write(msg.data)
          break
        }

        case 'pty_resize': {
          directPty.resize(msg.cols, msg.rows)
          break
        }

        case 'terminal_input':
          sshManager.runCommand(msg.data.replace(/\r?\n$/, ''))
          break

        case 'terminal_resize':
          // SSH PTY resize is handled by the SSH protocol itself
          break

        case 'ghost_type':
          if (directPty.isAlive) {
            directPty.ghostType(msg.command)
          } else {
            sshManager.ghostType(msg.command)
          }
          break

        case 'auto_fix': {
          if (directPty.isAlive) {
            stepEngine.runCurrentCommand((cmd) => directPty.runCommand(cmd))
          } else {
            stepEngine.runCurrentCommand((cmd) => sshManager.runCommand(cmd))
          }
          break
        }

        case 'next_step': {
          stepEngine.nextStep()
          const nextState = stepEngine.getState()
          if (nextState?.step?.command) {
            const output = directPty.isAlive
              ? directPty.getCleanOutput(20)
              : sshManager.getCleanOutput(20)
            mentor.explainStep(nextState.step, output)
          }
          break
        }

        case 'mentor_question': {
          const qState = stepEngine.getState()
          const output = directPty.isAlive
            ? directPty.getCleanOutput(30)
            : sshManager.getCleanOutput(30)
          mentor.answerQuestion(msg.question, {
            phase: qState.phase,
            step: qState.step,
            terminalOutput: output,
          })
          break
        }

        case 'mode_change':
          stepEngine.setMode(msg.mode)
          break

        default:
          console.warn('[SERVER] Unknown message type:', (msg as any).type)
      }
    } catch (err) {
      console.error('[SERVER] Failed to parse message:', err)
    }
  })

  ws.on('close', () => {
    console.log('[SERVER] Client disconnected')
    stepEngine.destroy()
    directPty.kill()
  })
})

server.listen(PORT, () => {
  console.log(`[SERVER] LaunchPad running on http://localhost:${PORT}`)
  console.log(`[SERVER] WebSocket endpoint: ws://localhost:${PORT}/ws`)
  console.log(`[SERVER] SSH terminal: ssh localhost -p ${SSH_PORT}`)
  console.log(`[SERVER] Project directory: ${PROJECT_DIR}`)
})
