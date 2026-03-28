import pty from 'node-pty'
import os from 'os'
import stripAnsi from 'strip-ansi'
import type { ServerMessage } from '../shared/types.js'

export class DirectPtyManager {
  private proc: pty.IPty | null = null
  private cleanBuffer: string[] = []
  private send: (msg: ServerMessage) => void

  constructor(send: (msg: ServerMessage) => void) {
    this.send = send
  }

  spawn(apiKey?: string) {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/zsh'
    const env = { ...process.env } as Record<string, string>
    if (apiKey) env.ANTHROPIC_API_KEY = apiKey

    this.proc = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: os.homedir(),
      env,
    })

    this.proc.onData((data) => {
      this.send({ type: 'pty_output', data })
      const clean = stripAnsi(data).replace(/\r/g, '')
      const lines = clean.split('\n').filter(Boolean)
      this.cleanBuffer.push(...lines)
      if (this.cleanBuffer.length > 500) this.cleanBuffer = this.cleanBuffer.slice(-500)
    })

    this.proc.onExit(({ exitCode }) => {
      console.log(`[DIRECT-PTY] Shell exited with code ${exitCode}`)
      this.proc = null
    })

    console.log(`[DIRECT-PTY] Spawned ${shell} in ${os.homedir()}`)
    this.send({ type: 'pty_ready' })
  }

  write(data: string) {
    this.proc?.write(data)
  }

  resize(cols: number, rows: number) {
    try {
      this.proc?.resize(cols, rows)
    } catch {
      // ignore resize errors on dead PTY
    }
  }

  getCleanOutput(n = 50): string {
    return this.cleanBuffer.slice(-n).join('\n')
  }

  async ghostType(command: string) {
    if (!this.proc) return
    for (const char of command) {
      this.proc.write(char)
      await new Promise((r) => setTimeout(r, 40))
    }
  }

  runCommand(command: string) {
    this.proc?.write(command + '\r')
  }

  kill() {
    try {
      this.proc?.kill()
    } catch {
      // ignore
    }
    this.proc = null
    this.cleanBuffer = []
  }

  get isAlive() {
    return this.proc !== null
  }
}
