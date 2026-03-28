import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import TOML from '@iarna/toml'
import type { ClientMessage, ServerMessage, FileTreeNode } from '../shared/types.js'
import { SSHManager } from './ssh-manager.js'
import { StepEngine } from './step-engine.js'
import { MentorEngine } from './mentor-engine.js'
import { TaskParser } from './forgeflow/task-parser.js'
import { TomlGenerator } from './forgeflow/toml-generator.js'
import { EnvGenerator } from './forgeflow/env-generator.js'
import { TemplateMapper } from './forgeflow/template-mapper.js'
import { FileGenerator } from './forgeflow/file-generator.js'
import { StepExpander } from './forgeflow/step-expander.js'

config()

const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
if (!geminiKey) {
  console.warn('[SERVER] ⚠️  GEMINI_API_KEY not set — AI mentor will use fallback responses')
} else {
  console.log('[SERVER] ✓ Gemini API key loaded')
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
    description: 'portfolio website',
    hint: 'A personal portfolio site with your name, bio, and projects section',
  })
})

// File tree endpoint
app.get('/api/file-tree', (req, res) => {
  const projectName = req.query.project as string | undefined
  const dir = projectName ? path.join(PROJECT_DIR, projectName) : PROJECT_DIR

  function buildTree(dirPath: string, depth = 0): FileTreeNode[] {
    if (depth > 4) return []
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      return entries
        .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules')
        .map((e) => {
          const fullPath = path.join(dirPath, e.name)
          const relativePath = path.relative(PROJECT_DIR, fullPath)
          if (e.isDirectory()) {
            return {
              name: e.name,
              type: 'directory' as const,
              path: relativePath,
              children: buildTree(fullPath, depth + 1),
            }
          }
          return { name: e.name, type: 'file' as const, path: relativePath }
        })
    } catch {
      return []
    }
  }

  if (!fs.existsSync(dir)) {
    return res.json([])
  }
  res.json(buildTree(dir))
})

// Sessions endpoint — scan for launch.toml files
app.get('/api/sessions', (_req, res) => {
  const sessions: Array<{ projectName: string; path: string }> = []
  try {
    const entries = fs.readdirSync(PROJECT_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const tomlPath = path.join(PROJECT_DIR, entry.name, 'launch.toml')
      if (fs.existsSync(tomlPath)) {
        sessions.push({ projectName: entry.name, path: tomlPath })
      }
    }
  } catch {}
  res.json(sessions)
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

// Periodically broadcast file tree while SSH is connected
let fileTreeTimer: ReturnType<typeof setInterval> | null = null

sshManager.onStatus((connected) => {
  if (connected) {
    fileTreeTimer = setInterval(() => {
      // Build tree and broadcast
      function buildTree(dirPath: string, depth = 0): FileTreeNode[] {
        if (depth > 4) return []
        try {
          const entries = fs.readdirSync(dirPath, { withFileTypes: true })
          return entries
            .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules')
            .map((e) => {
              const fullPath = path.join(dirPath, e.name)
              const relativePath = path.relative(PROJECT_DIR, fullPath)
              if (e.isDirectory()) {
                return {
                  name: e.name,
                  type: 'directory' as const,
                  path: relativePath,
                  children: buildTree(fullPath, depth + 1),
                }
              }
              return { name: e.name, type: 'file' as const, path: relativePath }
            })
        } catch {
          return []
        }
      }
      if (fs.existsSync(PROJECT_DIR)) {
        broadcast({ type: 'file_tree', tree: buildTree(PROJECT_DIR) })
      }
    }, 3000)
  } else {
    if (fileTreeTimer) {
      clearInterval(fileTreeTimer)
      fileTreeTimer = null
    }
  }
})

wss.on('connection', (ws: WebSocket) => {
  console.log('[SERVER] Client connected via WebSocket')

  // Send current SSH status immediately
  send(ws, { type: 'ssh_status', connected: sshManager.isConnected() })

  // Check for existing sessions on connect
  try {
    const entries = fs.readdirSync(PROJECT_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const tomlPath = path.join(PROJECT_DIR, entry.name, 'launch.toml')
      if (fs.existsSync(tomlPath)) {
        send(ws, { type: 'session_found', projectName: entry.name })
        break // send first match
      }
    }
  } catch {}

  const mentor = new MentorEngine(ws)
  const stepEngine = new StepEngine(
    ws,
    { getCleanOutput: (n) => sshManager.getCleanOutput(n) },
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
            content: '⚠️ Looks like this step is giving you trouble. Click **Auto-Fix** and I\'ll run the fix for you.',
          })
        }
      }
    },
    (phase) => {
      console.log('[SERVER] Phase complete:', phase)
    }
  )

  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'terminal_input':
          sshManager.runCommand(msg.data.replace(/\r?\n$/, ''))
          break

        case 'terminal_resize':
          // SSH PTY resize is handled by the SSH protocol itself
          break

        case 'ghost_type':
          sshManager.ghostType(msg.command)
          break

        case 'auto_fix': {
          stepEngine.runCurrentCommand((cmd) => sshManager.runCommand(cmd))
          break
        }

        case 'resume_project': {
          const tomlPath = path.join(PROJECT_DIR, msg.projectName, 'launch.toml')
          if (fs.existsSync(tomlPath)) {
            try {
              const tomlContent = fs.readFileSync(tomlPath, 'utf8')
              const toml = TOML.parse(tomlContent) as any
              const taskParser = new TaskParser()
              const plan = {
                name: msg.projectName,
                description: toml.description || msg.projectName,
                type: toml.type || 'website',
                features: toml.features || [],
                techStack: toml.techStack || [],
                estimatedSteps: 20,
              }
              const stepExpander = new StepExpander()
              const steps = stepExpander.expand(toml, plan)
              const phases = stepExpander.toPhaseDefinitions(steps)
              stepEngine.startProjectWithPhases(plan.name, plan.description, phases)
              const state = stepEngine.getState()
              if (state.step) mentor.explainStep(state.step, sshManager.getCleanOutput(10))
            } catch (err) {
              console.error('[SERVER] Failed to resume project:', err)
              stepEngine.startProject(msg.projectName)
            }
          } else {
            stepEngine.startProject(msg.projectName)
          }
          break
        }

        case 'start_project': {
          console.log('[SERVER] start_project:', msg.description)
          ;(async () => {
            try {
              send(ws, {
                type: 'mentor_message',
                messageType: 'encouragement',
                content: `Got it! Let me set up your **${msg.description}** project...`,
              })

              const taskParser = new TaskParser()
              const plan = await taskParser.parse(msg.description)
              send(ws, { type: 'plan_parsed', plan })
              console.log('[FORGEFLOW] Plan parsed:', plan.name)

              const tomlGen = new TomlGenerator()
              const tomlPath = await tomlGen.generate(plan, PROJECT_DIR)

              const envGen = new EnvGenerator()
              const envVars = envGen.generate(plan, PROJECT_DIR)
              if (envVars.length > 0) {
                send(ws, { type: 'env_generated', vars: envVars })
              }

              const templateMapper = new TemplateMapper()
              const template = templateMapper.map(plan)

              const fileGen = new FileGenerator()
              const files = await fileGen.generate(plan, template, PROJECT_DIR)
              send(ws, { type: 'files_generated', files })

              const tomlContent = fs.readFileSync(tomlPath, 'utf8')
              const toml = TOML.parse(tomlContent) as any
              const stepExpander = new StepExpander()
              const steps = stepExpander.expand(toml, plan)
              const phases = stepExpander.toPhaseDefinitions(steps)
              send(ws, { type: 'steps_expanded', steps })

              stepEngine.startProjectWithPhases(plan.name, plan.description, phases)
              const state = stepEngine.getState()
              if (state.step) {
                mentor.explainStep(state.step, sshManager.getCleanOutput(10))
              }
            } catch (err) {
              console.error('[FORGEFLOW] Pipeline error:', err)
              stepEngine.startProject(msg.description)
              const state = stepEngine.getState()
              if (state.step) {
                mentor.explainStep(state.step, sshManager.getCleanOutput(10))
              }
            }
          })()
          break
        }

        case 'next_step': {
          stepEngine.nextStep()
          const nextState = stepEngine.getState()
          if (nextState.step) {
            mentor.explainStep(nextState.step, sshManager.getCleanOutput(20))
          }
          break
        }

        case 'mentor_question': {
          const qState = stepEngine.getState()
          mentor.answerQuestion(msg.question, {
            phase: qState.phase,
            step: qState.step,
            terminalOutput: sshManager.getCleanOutput(30),
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
  })
})

server.listen(PORT, () => {
  console.log(`[SERVER] LaunchPad running on http://localhost:${PORT}`)
  console.log(`[SERVER] WebSocket endpoint: ws://localhost:${PORT}/ws`)
  console.log(`[SERVER] SSH terminal: ssh localhost -p ${SSH_PORT}`)
  console.log(`[SERVER] Project directory: ${PROJECT_DIR}`)
})
