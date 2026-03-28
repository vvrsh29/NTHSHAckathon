import Anthropic from '@anthropic-ai/sdk'
import type { WebSocket } from 'ws'
import type { ServerMessage, Step, Phase } from '../shared/types.js'

const MENTOR_SYSTEM_PROMPT = `You are LaunchPad's AI mentor — a warm, encouraging coding teacher for absolute beginners.

Rules:
- Explain EVERYTHING in plain language. No jargon without explanation.
- Use analogies from everyday life (folders = filing cabinets, terminal = a text conversation with your computer).
- Keep responses concise (2-4 sentences for explanations, more for errors).
- Use markdown for formatting: **bold** for key terms, \`code\` for commands/code.
- Be encouraging! Learning to code is hard and every small win matters.
- When explaining errors, always (1) explain what went wrong, (2) why it happened, (3) how to fix it.
- Never be condescending. The student is smart — they just haven't learned this yet.
- You are teaching HTML, CSS, and JavaScript fundamentals. No frameworks.`

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

export class MentorEngine {
  private client: Anthropic | null = null
  private ws: WebSocket

  constructor(ws: WebSocket) {
    this.ws = ws
    this.initClient()
  }

  private initClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && apiKey !== 'sk-ant-xxxxx') {
      this.client = new Anthropic({ apiKey })
    }
  }

  /** Re-check for API key (in case user provided it after startup) */
  refreshClient() {
    this.initClient()
  }

  async explainStep(step: Step, terminalOutput: string) {
    if (!this.client) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: step.explanation,
      })
      return
    }

    try {
      const stream = this.client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: MENTOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `The student is on step "${step.title}" (phase: ${step.phase}).
Step explanation: ${step.explanation}
${step.command ? `Command to type: \`${step.command}\`` : ''}
Recent terminal output:
\`\`\`
${terminalOutput.slice(-500)}
\`\`\`

Give a friendly, concise explanation of this step. If the terminal shows something notable, mention it.`,
          },
        ],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send(this.ws, {
            type: 'mentor_message',
            messageType: 'explanation',
            content: event.delta.text,
            streaming: true,
          })
        }
      }
    } catch (err) {
      console.error('[MENTOR] API error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: step.explanation + '\n\n*(AI mentor is temporarily unavailable — using built-in explanation)*',
      })
    }
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

    try {
      const stream = this.client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: MENTOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `The student got an error in the terminal. Help them understand what happened and how to fix it.

Error detected: ${error}

Recent terminal output:
\`\`\`
${terminalOutput.slice(-800)}
\`\`\`

Explain the error warmly, tell them what went wrong and how to fix it.`,
          },
        ],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send(this.ws, {
            type: 'mentor_message',
            messageType: 'error_help',
            content: event.delta.text,
            streaming: true,
          })
        }
      }
    } catch (err) {
      console.error('[MENTOR] API error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: `Something went wrong: \`${error}\`. Don't worry — errors happen all the time! Check for typos in your command and try again.`,
      })
    }
  }

  async answerQuestion(question: string, context: { phase: Phase; step: Step | null; terminalOutput: string }) {
    if (!this.client) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: `Great question! Unfortunately, the AI mentor needs an API key to answer questions. Add your ANTHROPIC_API_KEY to get personalized answers.`,
      })
      return
    }

    try {
      const stream = this.client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: MENTOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `The student is in the "${context.phase}" phase${context.step ? `, on step "${context.step.title}"` : ''}.

Recent terminal output:
\`\`\`
${context.terminalOutput.slice(-500)}
\`\`\`

Their question: "${question}"

Answer their question clearly and encouragingly. Use examples if it helps.`,
          },
        ],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send(this.ws, {
            type: 'mentor_message',
            messageType: 'explanation',
            content: event.delta.text,
            streaming: true,
          })
        }
      }
    } catch (err) {
      console.error('[MENTOR] API error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: `I had trouble connecting to the AI. Here's a tip: try searching your question online — sites like MDN Web Docs are great for learning web development!`,
      })
    }
  }
}
