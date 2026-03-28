import Anthropic from '@anthropic-ai/sdk'
import type { ParsedPlan } from '../../shared/types.js'

export class TaskParser {
  private client: Anthropic | null = null

  constructor() { this.refreshClient() }

  refreshClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey !== 'your-key-here') {
      this.client = new Anthropic({ apiKey })
    }
  }

  async parse(userInput: string): Promise<ParsedPlan> {
    if (!this.client) return this.heuristicParse(userInput)
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are a project classifier. Given a user's project idea, extract structured information and return ONLY valid JSON with no markdown, no explanation.

Return this exact shape:
{
  "name": "kebab-case-project-name",
  "description": "one sentence description",
  "type": "web-app",
  "features": ["feature1", "feature2", "feature3"],
  "techStack": ["html", "css", "javascript"],
  "estimatedSteps": 7
}

Rules:
- name must be lowercase kebab-case, max 30 chars
- type is always "web-app" for beginners
- features: 2-4 key features extracted from the description
- techStack: always ["html", "css", "javascript"]
- estimatedSteps: 5-10 based on complexity`,
        messages: [{ role: 'user', content: `Project idea: "${userInput}"` }],
      })
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return this.validate(JSON.parse(text.trim()))
    } catch (err) {
      console.error('[FORGEFLOW] Task parser error, using heuristic:', err)
      return this.heuristicParse(userInput)
    }
  }

  private heuristicParse(input: string): ParsedPlan {
    const name = input
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 30) || 'my-project'
    return {
      name,
      description: input,
      type: 'web-app',
      features: ['clean design', 'responsive layout', 'interactive elements'],
      techStack: ['html', 'css', 'javascript'],
      estimatedSteps: 7,
    }
  }

  private validate(plan: any): ParsedPlan {
    return {
      name: (plan.name || 'my-project').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 30),
      description: plan.description || 'A web project',
      type: 'web-app',
      features: Array.isArray(plan.features) ? plan.features.slice(0, 4) : [],
      techStack: ['html', 'css', 'javascript'],
      estimatedSteps: Math.min(Math.max(parseInt(plan.estimatedSteps) || 7, 5), 10),
    }
  }
}
