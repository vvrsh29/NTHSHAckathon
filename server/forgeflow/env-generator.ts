import * as fs from 'fs'
import * as path from 'path'
import type { ParsedPlan } from '../../shared/types.js'

interface EnvVar { key: string; comment: string; defaultValue?: string }

export class EnvGenerator {
  generate(plan: ParsedPlan, projectDir: string): string[] {
    const vars = this.detectRequiredVars(plan)
    if (vars.length === 0) {
      console.log('[FORGEFLOW] No env vars needed for this project')
      return []
    }
    const lines = [
      `# Environment variables for ${plan.name}`,
      `# Copy this file to .env and fill in the values`,
      '',
      ...vars.map(v => `# ${v.comment}\n${v.key}=${v.defaultValue || ''}`),
    ]
    const projectPath = path.join(projectDir, plan.name)
    fs.mkdirSync(projectPath, { recursive: true })
    fs.writeFileSync(path.join(projectPath, '.env.example'), lines.join('\n'), 'utf8')
    console.log('[FORGEFLOW] .env.example written with', vars.length, 'vars')
    return vars.map(v => v.key)
  }

  private detectRequiredVars(plan: ParsedPlan): EnvVar[] {
    const vars: EnvVar[] = []
    const text = (plan.features.join(' ') + ' ' + plan.description).toLowerCase()
    if (text.includes('api') || text.includes('fetch')) {
      vars.push({ key: 'API_KEY', comment: 'API key for external service (if needed)', defaultValue: '' })
    }
    if (text.includes('email') || text.includes('contact')) {
      vars.push({ key: 'EMAIL_ADDRESS', comment: 'Email address for contact form', defaultValue: 'your@email.com' })
    }
    return vars
  }
}
