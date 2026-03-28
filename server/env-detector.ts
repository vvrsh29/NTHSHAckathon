import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import type { EnvDetectionResult } from '../shared/types.js'

const execAsync = promisify(exec)

async function check(cmd: string): Promise<{ installed: boolean; version?: string }> {
  try {
    const { stdout } = await execAsync(cmd, { timeout: 5000 })
    const version = stdout.trim().match(/\d+\.\d+(\.\d+)?/)?.[0]
    return { installed: true, version }
  } catch {
    return { installed: false }
  }
}

export async function detectEnvironment(): Promise<EnvDetectionResult> {
  const platform = os.platform() === 'darwin' ? 'macos' : os.platform() === 'win32' ? 'windows' : 'linux'

  const [git, node, python, claudeCode, xcodeClT, vscode] = await Promise.all([
    check('git --version'),
    check('node --version'),
    check('python3 --version'),
    check('claude --version'),
    platform === 'macos'
      ? check('xcode-select -p').then((r) => ({ installed: r.installed }))
      : Promise.resolve({ installed: false }),
    check('code --version'),
  ])

  return {
    platform,
    git,
    node,
    python,
    claudeCode,
    xcodeClT: { installed: xcodeClT.installed },
    vscode: { installed: vscode.installed },
  }
}
