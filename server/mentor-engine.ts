import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WebSocket } from 'ws'
import type { ServerMessage, Step, Phase } from '../shared/types.js'

const MENTOR_SYSTEM_PROMPT = `You are LaunchPad's AI mentor — a warm, encouraging coding teacher for complete beginners.

Your student is building their very first website. They may never have used a terminal before.

Rules:
- Use plain language always. No jargon without a friendly explanation.
- Use analogies: terminal = "a text conversation with your computer", directory = "folder", npm = "app store for code".
- Keep explanations to 2-4 sentences. Be concise but warm.
- Use markdown: **bold** for key terms, \`backticks\` for commands and code.
- Every response should feel encouraging. Learning is hard and every win matters.
- For errors: always (1) what went wrong, (2) why it happens, (3) exactly how to fix it.
- Never be condescending. The student is smart — coding is just new to them.
- You are teaching HTML, CSS, and JavaScript. No frameworks, no TypeScript. Keep it simple.
- When a step completes successfully, celebrate it! "Nice work!" "You just did something real!"`

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
}

export class MentorEngine {
  private genAI: GoogleGenerativeAI | null = null
  private ws: WebSocket

  constructor(ws: WebSocket) {
    this.ws = ws
    this.initClient()
  }

  private initClient() {
    const apiKey = getApiKey()
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  refreshClient() {
    this.initClient()
  }

  async explainStep(step: Step, terminalOutput: string) {
    if (!this.genAI) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'instruction',
        content: `**${step.title}**\n\n${step.explanation}${step.command ? `\n\nType this command:\n\`\`\`\n${step.command}\n\`\`\`` : ''}`,
      })
      return
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: MENTOR_SYSTEM_PROMPT,
      })

      const prompt = `The student is on step "${step.title}" (phase: ${step.phase}).
Step explanation: ${step.explanation}
${step.command ? `Command to type: \`${step.command}\`` : ''}
Recent terminal output:
\`\`\`
${terminalOutput.slice(-500)}
\`\`\`

Give a friendly, concise explanation of this step. If the terminal shows something notable, mention it.`

      const result = await model.generateContentStream(prompt)

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          send(this.ws, {
            type: 'mentor_message',
            messageType: 'explanation',
            content: text,
            streaming: true,
          })
        }
      }
      send(this.ws, { type: 'mentor_message', messageType: 'explanation', content: '', streaming: false })
    } catch (err) {
      console.error('[MENTOR] Gemini error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: step.explanation + '\n\n*(AI mentor is temporarily unavailable — using built-in explanation)*',
      })
    }
  }

  async explainError(error: string, terminalOutput: string) {
    if (!this.genAI) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: `Something went wrong: \`${error}\`. Try checking the command for typos and try again.`,
      })
      return
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: MENTOR_SYSTEM_PROMPT,
      })

      const result = await model.generateContentStream(
        `The student got an error in the terminal. Help them understand what happened and how to fix it.

Error detected: ${error}

Recent terminal output:
\`\`\`
${terminalOutput.slice(-800)}
\`\`\`

Explain the error warmly, tell them what went wrong and how to fix it.`
      )

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          send(this.ws, { type: 'mentor_message', messageType: 'error_help', content: text, streaming: true })
        }
      }
      send(this.ws, { type: 'mentor_message', messageType: 'error_help', content: '', streaming: false })
    } catch (err) {
      console.error('[MENTOR] Gemini error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: `Something went wrong: \`${error}\`. Don't worry — errors happen all the time! Check for typos in your command and try again.`,
      })
    }
  }

  async answerQuestion(question: string, context: { phase: Phase; step: Step | null; terminalOutput: string }) {
    if (!this.genAI) {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: `Great question! Unfortunately, the AI mentor needs a Gemini API key to answer questions. Add your GEMINI_API_KEY to get personalized answers.`,
      })
      return
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: MENTOR_SYSTEM_PROMPT,
      })

      const result = await model.generateContentStream(
        `The student is in the "${context.phase}" phase${context.step ? `, on step "${context.step.title}"` : ''}.

Recent terminal output:
\`\`\`
${context.terminalOutput.slice(-500)}
\`\`\`

Their question: "${question}"

Answer their question clearly and encouragingly. Use examples if it helps.`
      )

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          send(this.ws, { type: 'mentor_message', messageType: 'explanation', content: text, streaming: true })
        }
      }
      send(this.ws, { type: 'mentor_message', messageType: 'explanation', content: '', streaming: false })
    } catch (err) {
      console.error('[MENTOR] Gemini error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'explanation',
        content: `I had trouble connecting to the AI. Here's a tip: try searching your question online — sites like MDN Web Docs are great for learning web development!`,
      })
    }
  }
}
