import ssh2pkg from 'ssh2'
const { Server: SSHServer } = ssh2pkg
import pty from 'node-pty'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { generateKeyPairSync } from 'crypto'
import stripAnsi from 'strip-ansi'

type OutputCallback = (data: string) => void
type StatusCallback = (connected: boolean) => void

export class SSHManager {
  private server: SSHServer
  private outputListeners: Set<OutputCallback> = new Set()
  private statusListeners: Set<StatusCallback> = new Set()
  private activePty: pty.IPty | null = null
  private cleanBuffer: string = ''
  private hostKeyPath: string
  private projectDir: string

  constructor(projectDir: string) {
    this.projectDir = projectDir

    // Cache host key to avoid slow RSA generation each restart
    this.hostKeyPath = path.join(os.homedir(), '.launchpad-host-key.pem')
    let hostKey: string

    if (fs.existsSync(this.hostKeyPath)) {
      hostKey = fs.readFileSync(this.hostKeyPath, 'utf8')
    } else {
      console.log('[SSH] Generating host key (one-time, takes a moment)...')
      const { privateKey } = (generateKeyPairSync as any)('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
      })
      hostKey = privateKey as string
      fs.writeFileSync(this.hostKeyPath, hostKey, { mode: 0o600 })
    }

    this.server = new SSHServer({ hostKeys: [hostKey] }, (client) => {
      console.log('[SSH] Client connected')

      client.on('authentication', (ctx) => {
        // Accept any auth for local dev
        ctx.accept()
      })

      client.on('session', (accept) => {
        const session = accept()
        let cols = 80
        let rows = 24

        session.on('pty', (accept, _reject, info) => {
          cols = info.cols || 80
          rows = info.rows || 24
          accept()
        })

        session.on('window-change', (_accept, _reject, info) => {
          if (this.activePty) {
            try { this.activePty.resize(info.cols, info.rows) } catch {}
          }
        })

        session.on('shell', (accept) => {
          const stream = accept()
          const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'zsh')

          // Ensure project dir exists
          if (!fs.existsSync(this.projectDir)) {
            fs.mkdirSync(this.projectDir, { recursive: true })
          }

          this.activePty = pty.spawn(shell, [], {
            name: 'xterm-256color',
            cols,
            rows,
            cwd: this.projectDir,
            env: { ...process.env, TERM: 'xterm-256color' } as Record<string, string>,
          })

          // Welcome banner
          stream.write('\r\n\x1b[1;35m╔══════════════════════════════════════════╗\r\n')
          stream.write('\x1b[1;35m║   🚀  Welcome to LaunchPad Terminal      ║\r\n')
          stream.write('\x1b[1;35m║   Your AI mentor is watching in the UI   ║\r\n')
          stream.write('\x1b[1;35m╚══════════════════════════════════════════╝\x1b[0m\r\n\r\n')

          this.activePty.onData((data) => {
            stream.write(data)
            this.cleanBuffer += stripAnsi(data)
            // Keep buffer trimmed
            const lines = this.cleanBuffer.split('\n')
            if (lines.length > 500) this.cleanBuffer = lines.slice(-300).join('\n')
            this.broadcastOutput(data)
          })

          this.activePty.onExit(({ exitCode }) => {
            console.log('[SSH] PTY exited with code', exitCode)
            stream.end()
            this.activePty = null
            this.broadcastStatus(false)
          })

          stream.on('data', (data: Buffer) => {
            if (this.activePty) this.activePty.write(data.toString())
          })

          stream.on('close', () => {
            if (this.activePty) {
              try { this.activePty.kill() } catch {}
              this.activePty = null
            }
            this.broadcastStatus(false)
          })

          this.broadcastStatus(true)
        })
      })

      client.on('close', () => {
        console.log('[SSH] Client disconnected')
        if (this.activePty) {
          try { this.activePty.kill() } catch {}
          this.activePty = null
        }
        this.broadcastStatus(false)
      })

      client.on('error', (err) => {
        console.error('[SSH] Client error:', err.message)
      })
    })
  }

  onOutput(cb: OutputCallback) {
    this.outputListeners.add(cb)
    return () => this.outputListeners.delete(cb)
  }

  onStatus(cb: StatusCallback) {
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }

  private broadcastOutput(data: string) {
    this.outputListeners.forEach(cb => cb(data))
  }

  private broadcastStatus(connected: boolean) {
    this.statusListeners.forEach(cb => cb(connected))
  }

  getCleanOutput(maxLines = 50): string {
    const lines = this.cleanBuffer.split('\n')
    return lines.slice(-maxLines).join('\n')
  }

  clearBuffer() {
    this.cleanBuffer = ''
  }

  isConnected(): boolean {
    return this.activePty !== null
  }

  ghostType(command: string) {
    if (!this.activePty) {
      console.warn('[SSH] No active PTY for ghost typing')
      return
    }
    // Type each character with small delay — NO enter at the end
    let i = 0
    const interval = setInterval(() => {
      if (!this.activePty || i >= command.length) {
        clearInterval(interval)
        return
      }
      this.activePty.write(command[i])
      i++
    }, 40)
  }

  runCommand(command: string) {
    if (!this.activePty) return
    this.activePty.write(command + '\r')
  }

  listen(port: number) {
    this.server.listen(port, '127.0.0.1', () => {
      console.log(`[SSH] Server listening on port ${port}`)
      console.log(`[SSH] Connect with: ssh localhost -p ${port}`)
    })

    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[SSH] Port ${port} already in use — kill the process using it`)
      } else {
        console.error('[SSH] Server error:', err)
      }
    })
  }

  close() {
    try { this.server.close() } catch {}
  }
}
