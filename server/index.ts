import express from 'express'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import type { ClientMessage, ServerMessage } from '../shared/types.js'
import { PtyManager } from './pty-manager.js'

config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '3456', 10)
const PROJECT_DIR = process.env.PROJECT_DIR
  ? process.env.PROJECT_DIR.replace('~', process.env.HOME || '')
  : path.join(process.env.HOME || '', 'launchpad-projects')

const app = express()
app.use(express.json())

// Serve static files in production
const clientDist = path.resolve(__dirname, '../dist/client')
app.use(express.static(clientDist))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, projectDir: PROJECT_DIR })
})

const server = createServer(app)
const wss = new WebSocketServer({ noServer: true })

// Upgrade HTTP → WS on /ws path
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

// Helper to send typed messages
function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[SERVER] Client connected via WebSocket')

  // Create a PTY for this connection
  const pty = new PtyManager(PROJECT_DIR, (data: string) => {
    send(ws, { type: 'terminal_output', data })
  })

  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'terminal_input':
          pty.write(msg.data)
          break

        case 'terminal_resize':
          pty.resize(msg.cols, msg.rows)
          break

        case 'start_project':
          console.log('[SERVER] start_project:', msg.description)
          // Store API key if provided
          if (msg.apiKey) {
            process.env.ANTHROPIC_API_KEY = msg.apiKey
          }
          // Will be handled by step-engine (Agent 3)
          send(ws, {
            type: 'mentor_message',
            messageType: 'encouragement',
            content: `Great! Let's build: **${msg.description}**. Starting the setup phase now...`,
          })
          send(ws, {
            type: 'step_update',
            phase: 'setup',
            stepIndex: 0,
            step: {
              id: 'welcome',
              phase: 'setup',
              title: 'Welcome to LaunchPad!',
              explanation: 'We are about to set up your project. Follow the commands shown to get started.',
            },
          })
          break

        case 'next_step':
          console.log('[SERVER] next_step requested')
          // Will be handled by step-engine (Agent 3)
          break

        case 'mentor_question':
          console.log('[SERVER] mentor_question:', msg.question)
          // Will be handled by mentor-engine (Agent 3)
          send(ws, {
            type: 'mentor_message',
            messageType: 'explanation',
            content: `That's a great question! The mentor engine will answer "${msg.question}" once it's wired up.`,
          })
          break

        case 'mode_change':
          console.log('[SERVER] mode_change:', msg.mode)
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
    pty.kill()
  })
})

server.listen(PORT, () => {
  console.log(`[SERVER] LaunchPad running on http://localhost:${PORT}`)
  console.log(`[SERVER] WebSocket endpoint: ws://localhost:${PORT}/ws`)
  console.log(`[SERVER] Project directory: ${PROJECT_DIR}`)
})
