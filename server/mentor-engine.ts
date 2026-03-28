import Anthropic from '@anthropic-ai/sdk'
import type { WebSocket } from 'ws'
import type { ServerMessage, MentorMessageType, Step, Phase } from '../shared/types.js'

const MENTOR_SYSTEM_PROMPT = `You are LaunchPad's AI mentor helping beginners learn Claude Code.
Rules:
- 1-2 sentences MAX. Be terse.
- Use **bold** for key terms, \`backticks\` for commands
- Never repeat what's already shown in the step explanation
- Celebrate wins briefly
- Use the user's name occasionally if provided`

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

export class MentorEngine {
  private client: Anthropic | null = null
  private ws: WebSocket
  private userName = ''
  private queue: Array<() => Promise<void>> = []
  private processing = false

  constructor(ws: WebSocket) {
    this.ws = ws
    this.initClient()
  }

  private initClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    } else {
      this.client = null
    }
  }

  refreshClient() {
    this.initClient()
  }

  setUserName(name: string) {
    this.userName = name
  }

  private async enqueue(fn: () => Promise<void>) {
    this.queue.push(fn)
    if (this.processing) return
    this.processing = true
    while (this.queue.length > 0) {
      const next = this.queue.shift()!
      await next()
    }
    this.processing = false
  }

  private async streamResponse(systemPrompt: string, userPrompt: string, messageType: MentorMessageType) {
    if (!this.client) {
      // Fallback — no API key available
      send(this.ws, {
        type: 'mentor_message',
        messageType,
        content: userPrompt,
        streaming: false,
      })
      return
    }

    try {
      const finalSystemPrompt = this.userName
        ? `${systemPrompt}\nThe user's name is ${this.userName}.`
        : systemPrompt

      const stream = this.client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: finalSystemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send(this.ws, {
            type: 'mentor_message',
            messageType,
            content: event.delta.text,
            streaming: true,
          })
        }
      }
      send(this.ws, { type: 'mentor_message', messageType, content: '', streaming: false })
    } catch (err) {
      console.error('[MENTOR] Anthropic error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType,
        content: '*(AI mentor is temporarily unavailable — using built-in explanation)*',
        streaming: false,
      })
    }
  }

  async explainStep(step: Step, terminalOutput: string) {
    if (!this.client) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'instruction',
        content: `**${step.title}**\n\n${step.explanation}${step.command ? `\n\nType this command:\n\`\`\`\n${step.command}\n\`\`\`` : ''}`,
      })
      return
    }

    const userPrompt = `The student is on step "${step.title}" (phase: ${step.phase}).
Step explanation: ${step.explanation}
${step.command ? `Command to type: \`${step.command}\`` : ''}
Recent terminal output:
\`\`\`
${terminalOutput.slice(-500)}
\`\`\`

Give a friendly, concise explanation of this step. If the terminal shows something notable, mention it.`

    await this.enqueue(() => this.streamResponse(MENTOR_SYSTEM_PROMPT, userPrompt, 'explanation'))
  }

  async explainError(error: string, terminalOutput: string) {
    if (!this.client) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: `Something went wrong: \`${error}\`. Try checking the command for typos and try again.`,
      })
      return
    }

    const userPrompt = `The student got an error in the terminal. Help them understand what happened and how to fix it.

Error detected: ${error}

Recent terminal output:
\`\`\`
${terminalOutput.slice(-800)}
\`\`\`

Explain the error warmly, tell them what went wrong and how to fix it.`

    await this.enqueue(() => this.streamResponse(MENTOR_SYSTEM_PROMPT, userPrompt, 'error_help'))
  }

  async answerQuestion(question: string, context: { phase: Phase; step: Step | null; terminalOutput: string }) {
    if (!this.client) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: `Great question! Unfortunately, the AI mentor needs an Anthropic API key to answer questions. Add your ANTHROPIC_API_KEY to get personalized answers.`,
      })
      return
    }

    const userPrompt = `The student is in the "${context.phase}" phase${context.step ? `, on step "${context.step.title}"` : ''}.

Recent terminal output:
\`\`\`
${context.terminalOutput.slice(-500)}
\`\`\`

Their question: "${question}"

Answer their question clearly and encouragingly. Use examples if it helps.`

    await this.enqueue(() => this.streamResponse(MENTOR_SYSTEM_PROMPT, userPrompt, 'explanation'))
  }
}
