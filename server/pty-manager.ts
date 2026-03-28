import pty from 'node-pty'
import os from 'os'
import fs from 'fs'
import stripAnsi from 'strip-ansi'

export class PtyManager {
  private ptyProcess: pty.IPty
  private outputBuffer: string = ''
  private cleanBuffer: string = ''

  constructor(cwd: string, onData: (data: string) => void) {
    // Ensure cwd exists
    if (!fs.existsSync(cwd)) {
      fs.mkdirSync(cwd, { recursive: true })
    }

    const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash')

    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
      } as Record<string, string>,
    })

    this.ptyProcess.onData((data: string) => {
      this.outputBuffer += data
      this.cleanBuffer += stripAnsi(data)
      onData(data)
    })

    this.ptyProcess.onExit(({ exitCode }) => {
      console.log(`[PTY] Shell exited with code ${exitCode}`)
    })

    console.log(`[PTY] Spawned ${shell} in ${cwd}`)
  }

  write(data: string) {
    this.ptyProcess.write(data)
  }

  resize(cols: number, rows: number) {
    try {
      this.ptyProcess.resize(cols, rows)
    } catch {
      // ignore resize errors on dead PTY
    }
  }

  /** Get recent clean (ANSI-stripped) output for AI context */
  getCleanOutput(maxLines = 50): string {
    const lines = this.cleanBuffer.split('\n')
    return lines.slice(-maxLines).join('\n')
  }

  /** Clear the output buffer */
  clearBuffer() {
    this.outputBuffer = ''
    this.cleanBuffer = ''
  }

  kill() {
    try {
      this.ptyProcess.kill()
    } catch {
      // ignore
    }
  }
}
