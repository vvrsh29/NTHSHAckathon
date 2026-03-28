import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ParsedPlan } from '../../shared/types.js'

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
}

export class TaskParser {
  private genAI: GoogleGenerativeAI | null = null

  constructor() { this.refreshClient() }

  refreshClient() {
    const apiKey = getApiKey()
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async parse(userInput: string): Promise<ParsedPlan> {
    if (!this.genAI) return this.heuristicParse(userInput)
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a project classifier. Given a user's project idea, extract structured information and return ONLY valid JSON with no markdown, no explanation, no code fences.

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
      })

      const result = await model.generateContent(`Project idea: "${userInput}"`)
      const text = result.response.text().trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')
      return this.validate(JSON.parse(jsonMatch[0]))
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
