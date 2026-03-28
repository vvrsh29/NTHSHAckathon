import * as fs from 'fs'
import * as path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import type { ParsedPlan } from '../../shared/types.js'
import type { TemplateConfig } from './template-mapper.js'

export class FileGenerator {
  private client: Anthropic | null = null

  constructor() { this.refreshClient() }

  refreshClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey !== 'your-key-here') {
      this.client = new Anthropic({ apiKey })
    }
  }

  async generate(plan: ParsedPlan, template: TemplateConfig, projectDir: string): Promise<string[]> {
    const projectPath = path.join(projectDir, plan.name)
    fs.mkdirSync(projectPath, { recursive: true })
    const files: string[] = []

    for (const fileSpec of template.files) {
      const content = await this.generateFileContent(fileSpec.template, plan, template)
      fs.writeFileSync(path.join(projectPath, fileSpec.path), content, 'utf8')
      files.push(fileSpec.path)
      console.log('[FORGEFLOW] Generated:', fileSpec.path)
    }

    fs.writeFileSync(path.join(projectPath, 'README.md'), this.generateReadme(plan), 'utf8')
    files.push('README.md')

    fs.mkdirSync(path.join(projectPath, 'prompts'), { recursive: true })
    fs.writeFileSync(
      path.join(projectPath, 'prompts', 'system-prompt.txt'),
      this.generateSystemPrompt(plan, template),
      'utf8'
    )
    files.push('prompts/system-prompt.txt')

    return files
  }

  private async generateFileContent(templateId: string, plan: ParsedPlan, template: TemplateConfig): Promise<string> {
    if (this.client) {
      try { return await this.generateWithClaude(templateId, plan, template) }
      catch (err) { console.warn('[FORGEFLOW] Claude generation failed, using fallback:', err) }
    }
    return this.getFallbackContent(templateId, plan)
  }

  private async generateWithClaude(templateId: string, plan: ParsedPlan, template: TemplateConfig): Promise<string> {
    const isHtml = templateId.includes('html')
    const isCss = templateId.includes('css')
    const fileType = isHtml ? 'HTML' : isCss ? 'CSS' : 'JavaScript'
    const ext = isHtml ? 'html' : isCss ? 'css' : 'js'

    const response = await this.client!.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: template.starterPrompt + '\n\nIMPORTANT: Return ONLY the file content, no markdown, no explanation, no code fences.',
      messages: [{
        role: 'user',
        content: `Generate a starter ${fileType} file for:
Name: ${plan.name}
Description: ${plan.description}
Features: ${plan.features.join(', ')}

Well-structured .${ext} file with placeholder content and helpful comments. Beginner-friendly.`,
      }],
    })
    return response.content[0].type === 'text' ? response.content[0].text : this.getFallbackContent(templateId, plan)
  }

  private getFallbackContent(templateId: string, plan: ParsedPlan): string {
    const title = plan.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (templateId.includes('html')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header><h1>${title}</h1><p>${plan.description}</p></header>
  <main><p>Start building your project!</p></main>
  <footer><p>Built with LaunchPad</p></footer>
  <script src="script.js"></script>
</body>
</html>`
    }
    if (templateId.includes('css')) {
      return `/* ${title} Styles */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --color-bg: #0f172a; --color-surface: #1e293b;
  --color-text: #f1f5f9; --color-accent: #6366f1;
}
body { background: var(--color-bg); color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.6; min-height: 100vh; }
header { padding: 2rem; text-align: center; background: var(--color-surface); }
h1 { font-size: 2.5rem; color: var(--color-accent); }
main { max-width: 900px; margin: 0 auto; padding: 2rem; }`
    }
    return `// ${title} — Main Script
document.addEventListener('DOMContentLoaded', () => {
  console.log('${title} loaded!')
  // Your JavaScript goes here
})`
  }

  private generateReadme(plan: ParsedPlan): string {
    const title = plan.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return `# ${title}\n\n${plan.description}\n\n## Features\n${plan.features.map(f => `- ${f}`).join('\n')}\n\n## How to run\n\nOpen \`index.html\` in your browser — no build step needed!\n\n\`\`\`bash\nopen index.html\n\`\`\`\n\n*Built with [LaunchPad](https://github.com/vvrsh29/NTHSHAckathon)*\n`
  }

  private generateSystemPrompt(plan: ParsedPlan, template: TemplateConfig): string {
    return `You are helping build: ${plan.name}\nDescription: ${plan.description}\nType: ${plan.type}\nFeatures: ${plan.features.join(', ')}\n\n${template.starterPrompt}\n\nKeep code simple, well-commented, and beginner-friendly. No external libraries.\n`
  }
}
