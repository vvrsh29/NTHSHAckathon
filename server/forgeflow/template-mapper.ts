import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import type { ParsedPlan } from '../../shared/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface TemplateConfig {
  id: string
  name: string
  files: Array<{ path: string; template: string }>
  phases: string[]
  starterPrompt: string
}

export class TemplateMapper {
  private templatesDir = path.join(__dirname, 'templates')

  map(plan: ParsedPlan): TemplateConfig {
    const templateId = this.resolveTemplateId(plan.type)
    const templatePath = path.join(this.templatesDir, `${templateId}.json`)
    try {
      return JSON.parse(fs.readFileSync(templatePath, 'utf8')) as TemplateConfig
    } catch {
      console.warn('[FORGEFLOW] Template not found for type:', plan.type, '— using generic')
      return JSON.parse(fs.readFileSync(path.join(this.templatesDir, 'generic.json'), 'utf8')) as TemplateConfig
    }
  }

  private resolveTemplateId(type: string): string {
    const map: Record<string, string> = {
      'web-app': 'web-app',
      'tool': 'tool',
      'game': 'game',
      'api': 'generic',
    }
    return map[type] || 'generic'
  }
}
