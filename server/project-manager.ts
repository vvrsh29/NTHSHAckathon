import fs from 'fs'
import path from 'path'
import type { GeneratedFile } from '../shared/types.js'

export class ProjectManager {
  private baseDir: string

  constructor(baseDir: string) {
    this.baseDir = baseDir
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }
  }

  getProjectDir(projectName: string): string {
    return path.join(this.baseDir, projectName)
  }

  ensureProjectDir(projectName: string): string {
    const dir = this.getProjectDir(projectName)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  writeFiles(projectName: string, files: GeneratedFile[]): void {
    const projectDir = this.ensureProjectDir(projectName)

    for (const file of files) {
      const filePath = path.join(projectDir, file.path)
      const fileDir = path.dirname(filePath)

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true })
      }

      fs.writeFileSync(filePath, file.content, 'utf-8')
      console.log(`[PROJECT] Wrote: ${filePath}`)
    }
  }

  readFile(projectName: string, filePath: string): string | null {
    const fullPath = path.join(this.getProjectDir(projectName), filePath)
    try {
      return fs.readFileSync(fullPath, 'utf-8')
    } catch {
      return null
    }
  }

  listFiles(projectName: string): string[] {
    const dir = this.getProjectDir(projectName)
    if (!fs.existsSync(dir)) return []

    const files: string[] = []
    function walk(currentDir: string, prefix: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
        if (entry.isDirectory()) {
          walk(path.join(currentDir, entry.name), relativePath)
        } else {
          files.push(relativePath)
        }
      }
    }
    walk(dir, '')
    return files
  }
}
