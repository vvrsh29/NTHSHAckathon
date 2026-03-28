import * as fs from 'fs'
import * as path from 'path'
import TOML from '@iarna/toml'
import type { ParsedPlan } from '../../shared/types.js'

export class TomlGenerator {
  async generate(plan: ParsedPlan, projectDir: string): Promise<string> {
    const tomlData = {
      project: {
        name: plan.name,
        description: plan.description,
        type: plan.type,
        features: plan.features,
      },
      phases: [
        { id: 'setup', steps: ['mkdir', 'cd', 'pwd'] },
        { id: 'scaffold', steps: ['touch-html', 'touch-css', 'touch-js', 'ls'] },
        { id: 'build', steps: ['ai-generate', 'view-html', 'view-css'] },
        { id: 'style', steps: ['ai-enhance', 'view-result'] },
        { id: 'deploy', steps: ['open-browser', 'celebrate'] },
      ],
    }

    const tomlStr = TOML.stringify(tomlData as any)
    const projectPath = path.join(projectDir, plan.name)
    fs.mkdirSync(projectPath, { recursive: true })
    const tomlPath = path.join(projectPath, 'launch.toml')
    fs.writeFileSync(tomlPath, tomlStr, 'utf8')
    console.log('[FORGEFLOW] launch.toml written to', tomlPath)
    return tomlPath
  }
}
