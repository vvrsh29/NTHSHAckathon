import Anthropic from '@anthropic-ai/sdk'
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

export class CodeGenerator {
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

  refreshClient() {
    this.initClient()
  }

  async generateCode(description: string, step: Step): Promise<GeneratedFile[]> {
    if (!this.client) {
      // Return placeholder code when no API key
      return this.getPlaceholderCode(description)
    }

    try {
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'instruction',
        content: '✨ Generating your code with AI... This takes a few seconds.',
      })

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: CODE_GEN_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Generate a complete website for: "${description}"

The project is currently in the "${step.phase}" phase, step "${step.title}".
Create all the files needed for a beautiful, functional website.
Make it impressive but keep the code beginner-friendly with lots of comments.`,
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''

      // Parse JSON from response
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
      console.error('[CODEGEN] API error:', err)
      send(this.ws, {
        type: 'mentor_message',
        messageType: 'error_help',
        content: 'I had trouble generating the code. Using a template instead — you can customize it later!',
      })
      return this.getPlaceholderCode(description)
    }
  }

  private getPlaceholderCode(description: string): GeneratedFile[] {
    const files: GeneratedFile[] = [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${description}</h1>
        <p>Built with LaunchPad</p>
    </header>
    <main>
        <section class="hero">
            <h2>Welcome!</h2>
            <p>This is your website. Edit the HTML to make it yours!</p>
        </section>
    </main>
    <footer>
        <p>Made with ❤️ using LaunchPad</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`,
        explanation: 'The main HTML file — this is the structure of your website.',
      },
      {
        path: 'style.css',
        content: `/* CSS Variables — change these to update your whole color scheme */
:root {
    --primary: #6366f1;
    --bg: #0f172a;
    --text: #e2e8f0;
    --card-bg: #1e293b;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
}

header {
    text-align: center;
    padding: 3rem 1rem;
    background: linear-gradient(135deg, var(--primary), #8b5cf6);
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.hero {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
}

footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}`,
        explanation: 'The CSS file — this controls all the colors, fonts, and layout.',
      },
      {
        path: 'script.js',
        content: `// JavaScript — this makes your page interactive!

// Wait for the page to load before running code
document.addEventListener('DOMContentLoaded', () => {
    console.log('Your website is running! 🚀');

    // Example: add a click handler to the hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('click', () => {
            hero.style.transform = 'scale(1.02)';
            setTimeout(() => {
                hero.style.transform = 'scale(1)';
            }, 200);
        });
    }
});`,
        explanation: 'The JavaScript file — this adds interactivity to your page.',
      },
    ]

    send(this.ws, {
      type: 'code_generated',
      files,
      explanation: 'Generated a starter website template. Customize it to make it yours!',
    })

    return files
  }
}
