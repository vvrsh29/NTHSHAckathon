import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WebSocket } from 'ws'
import type { ServerMessage, GeneratedFile, Step } from '../shared/types.js'

const CODE_GEN_SYSTEM_PROMPT = `You are a code generator for absolute beginners learning web development.

Rules:
- Generate plain HTML, CSS, and JavaScript ONLY. No frameworks, no build tools, no TypeScript.
- Code must be simple, well-commented, and readable by a complete beginner.
- Use descriptive variable names (not x, y, z).
- Add comments explaining what each section does.
- HTML should be semantic (use <header>, <main>, <footer>, <section>, <nav>).
- CSS should use modern features (flexbox, CSS variables) but nothing too advanced.
- JavaScript should use addEventListener, querySelector, and simple DOM manipulation.
- Make it look good! Use a nice color scheme, good typography, proper spacing.
- Output must be valid, working code that opens correctly in a browser.

Respond ONLY with valid JSON in this exact format:
{
  "files": [
    { "path": "index.html", "content": "...", "explanation": "..." },
    { "path": "style.css", "content": "...", "explanation": "..." },
    { "path": "script.js", "content": "...", "explanation": "..." }
  ],
  "summary": "One sentence describing what was generated."
}`

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
}

export class CodeGenerator {
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

  async generateCode(description: string, step: Step): Promise<GeneratedFile[]> {
    if (!this.genAI) {
      return this.getPlaceholderCode(description)
    }

    try {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'instruction',
        content: '✨ Generating your code with AI... This takes a few seconds.',
      })

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: CODE_GEN_SYSTEM_PROMPT,
      })

      const result = await model.generateContent(
        `Generate a complete website for: "${description}"

The project is currently in the "${step.phase}" phase, step "${step.title}".
Create all the files needed for a beautiful, functional website.
Make it impressive but keep the code beginner-friendly with lots of comments.`
      )

      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[CODEGEN] Could not parse JSON from response')
        return this.getPlaceholderCode(description)
      }

      const parsed = JSON.parse(jsonMatch[0])
      const files: GeneratedFile[] = parsed.files || []

      send(this.ws, {
        type: 'code_generated',
        files,
        explanation: parsed.summary || 'Code generated successfully!',
      })

      return files
    } catch (err) {
      console.error('[CODEGEN] Gemini error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: 'I had trouble generating the code. Using a template instead — you can customize it later!',
      })
      return this.getPlaceholderCode(description)
    }
  }

  private getPlaceholderCode(description: string): GeneratedFile[] {
    const title = description
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    const files: GeneratedFile[] = [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <span class="nav-brand">${title}</span>
    </nav>
    <header class="hero">
        <h1>${title}</h1>
        <p>${description}</p>
    </header>
    <main>
        <section id="about">
            <h2>About</h2>
            <p>Edit this section to tell your story.</p>
        </section>
    </main>
    <footer><p>Built with LaunchPad</p></footer>
    <script src="script.js"></script>
</body>
</html>`,
        explanation: 'The main HTML file with page structure.',
      },
      {
        path: 'style.css',
        content: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { --primary: #6366f1; --bg: #0f172a; --surface: #1e293b; --text: #e2e8f0; --muted: #94a3b8; }
body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; line-height: 1.7; min-height: 100vh; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--surface); }
.nav-brand { font-weight: 700; color: var(--primary); }
.hero { text-align: center; padding: 5rem 1.5rem; }
.hero h1 { font-size: 3rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem; }
.hero p { color: var(--muted); font-size: 1.1rem; }
section { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem; }
footer { text-align: center; padding: 2rem; color: var(--muted); border-top: 1px solid rgba(255,255,255,0.07); }`,
        explanation: 'Styles for the page.',
      },
      {
        path: 'script.js',
        content: `document.addEventListener('DOMContentLoaded', () => {
    console.log('${title} loaded!')
    // Add your JavaScript here
})`,
        explanation: 'JavaScript for interactivity.',
      },
    ]

    send(this.ws, {
      type: 'code_generated',
      files,
      explanation: `Generated a starter site for "${description}".`,
    })

    return files
  }
}
