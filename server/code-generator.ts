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
    // Derive a display-friendly title from the description
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

    <!-- ============================================================
         All styles are written right here in a <style> block.
         This means your site works with just ONE file — index.html!
         ============================================================ -->
    <style>
        /* ── CSS Variables ─────────────────────────────────────────
           Change these four values to completely restyle the page. */
        :root {
            --primary:   #6366f1;   /* purple accent */
            --primary-2: #8b5cf6;   /* lighter purple for gradients */
            --bg:        #0f172a;   /* very dark blue background */
            --surface:   #1e293b;   /* slightly lighter surface colour */
            --text:      #e2e8f0;   /* light grey text */
            --muted:     #94a3b8;   /* dimmer text for captions */
            --radius:    12px;      /* rounded corner size */
        }

        /* ── Reset ──────────────────────────────────────────────── */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* ── Base ───────────────────────────────────────────────── */
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            min-height: 100vh;
        }

        a {
            color: var(--primary);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        /* ── Navigation ─────────────────────────────────────────── */
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 2rem;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            position: sticky;
            top: 0;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(10px);
            z-index: 100;
        }

        .nav-brand {
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--text);
        }

        .nav-links {
            display: flex;
            gap: 1.75rem;
            list-style: none;
        }

        .nav-links a {
            color: var(--muted);
            font-size: 0.95rem;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--text);
            text-decoration: none;
        }

        /* ── Hero Section ───────────────────────────────────────── */
        .hero {
            text-align: center;
            padding: 6rem 1.5rem 5rem;
            background: linear-gradient(160deg, #0f172a 0%, #1a1040 100%);
            position: relative;
            overflow: hidden;
        }

        /* Decorative glowing orb behind hero text */
        .hero::before {
            content: '';
            position: absolute;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }

        .hero-badge {
            display: inline-block;
            background: rgba(99,102,241,0.15);
            color: var(--primary);
            border: 1px solid rgba(99,102,241,0.35);
            border-radius: 999px;
            padding: 0.3rem 1rem;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 1.5rem;
        }

        .hero h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 800;
            line-height: 1.15;
            margin-bottom: 1.25rem;
            /* Gradient text effect */
            background: linear-gradient(135deg, #e2e8f0 0%, var(--primary-2) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero p {
            font-size: 1.15rem;
            color: var(--muted);
            max-width: 540px;
            margin: 0 auto 2.25rem;
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: linear-gradient(135deg, var(--primary), var(--primary-2));
            color: #fff;
            border-radius: 999px;
            font-weight: 600;
            font-size: 1rem;
            transition: opacity 0.2s, transform 0.15s;
            cursor: pointer;
            border: none;
        }

        .btn:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            text-decoration: none;
        }

        /* ── Shared Section Styles ──────────────────────────────── */
        section {
            padding: 4rem 1.5rem;
            max-width: 900px;
            margin: 0 auto;
        }

        .section-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .section-subtitle {
            color: var(--muted);
            margin-bottom: 2.5rem;
        }

        /* ── About Section ──────────────────────────────────────── */
        .about-card {
            background: var(--surface);
            border-radius: var(--radius);
            padding: 2rem 2.25rem;
            border: 1px solid rgba(255,255,255,0.06);
        }

        .about-card p + p {
            margin-top: 1rem;
        }

        /* ── Projects Grid ──────────────────────────────────────── */
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.25rem;
        }

        .project-card {
            background: var(--surface);
            border-radius: var(--radius);
            padding: 1.5rem;
            border: 1px solid rgba(255,255,255,0.06);
            transition: border-color 0.2s, transform 0.2s;
            cursor: default;
        }

        .project-card:hover {
            border-color: rgba(99,102,241,0.45);
            transform: translateY(-3px);
        }

        .project-icon {
            font-size: 2rem;
            margin-bottom: 0.75rem;
        }

        .project-card h3 {
            font-size: 1.05rem;
            font-weight: 600;
            margin-bottom: 0.4rem;
        }

        .project-card p {
            color: var(--muted);
            font-size: 0.9rem;
            line-height: 1.55;
        }

        .project-tag {
            display: inline-block;
            margin-top: 0.9rem;
            background: rgba(99,102,241,0.12);
            color: var(--primary);
            border-radius: 999px;
            padding: 0.2rem 0.7rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        /* ── Footer ─────────────────────────────────────────────── */
        footer {
            text-align: center;
            padding: 2.5rem 1rem;
            color: var(--muted);
            font-size: 0.9rem;
            border-top: 1px solid rgba(255,255,255,0.07);
        }
    </style>
</head>
<body>

    <!-- ── Navigation ─────────────────────────────────────────── -->
    <nav>
        <span class="nav-brand">${title}</span>
        <ul class="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>

    <!-- ── Hero ───────────────────────────────────────────────── -->
    <header class="hero">
        <div class="hero-badge">Open to opportunities</div>
        <h1>Hi, I'm a Developer<br>& Builder</h1>
        <p>I create things for the web. This is where I share the projects I'm most proud of.</p>
        <a href="#projects" class="btn">See My Work</a>
    </header>

    <main>

        <!-- ── About ──────────────────────────────────────────── -->
        <section id="about">
            <h2 class="section-title">About Me</h2>
            <p class="section-subtitle">A little about who I am and what I do.</p>
            <div class="about-card">
                <p>
                    I'm a curious developer who loves learning new technologies and building things
                    that solve real problems. I started coding because I wanted to turn ideas into
                    reality — and I haven't stopped since.
                </p>
                <p>
                    When I'm not writing code, you'll find me exploring design, reading about
                    technology, or working on side projects just for fun. This portfolio was built
                    from scratch using plain HTML, CSS, and JavaScript.
                </p>
            </div>
        </section>

        <!-- ── Projects ───────────────────────────────────────── -->
        <section id="projects">
            <h2 class="section-title">Projects</h2>
            <p class="section-subtitle">Things I've built that I'm proud of.</p>
            <div class="projects-grid">

                <div class="project-card">
                    <div class="project-icon">🚀</div>
                    <h3>${title}</h3>
                    <p>My portfolio website — built live from the terminal during a hackathon using LaunchPad.</p>
                    <span class="project-tag">HTML / CSS / JS</span>
                </div>

                <div class="project-card">
                    <div class="project-icon">🛠️</div>
                    <h3>Project Two</h3>
                    <p>Replace this with a real project you've worked on. Describe it in one or two sentences.</p>
                    <span class="project-tag">Coming Soon</span>
                </div>

                <div class="project-card">
                    <div class="project-icon">💡</div>
                    <h3>Project Three</h3>
                    <p>Another great project goes here. What problem did it solve? Who did you build it for?</p>
                    <span class="project-tag">Coming Soon</span>
                </div>

            </div>
        </section>

        <!-- ── Contact ────────────────────────────────────────── -->
        <section id="contact">
            <h2 class="section-title">Get In Touch</h2>
            <p class="section-subtitle">
                Have an idea or want to work together?
                <a href="mailto:hello@example.com">Send me an email</a> — I'd love to hear from you.
            </p>
        </section>

    </main>

    <!-- ── Footer ─────────────────────────────────────────────── -->
    <footer>
        <p>Built with LaunchPad &mdash; ${new Date().getFullYear()}</p>
    </footer>

    <!-- ── JavaScript ─────────────────────────────────────────── -->
    <script src="script.js"></script>

</body>
</html>`,
        explanation: 'The main HTML file — it contains the full page structure along with all the styles baked in, so it works with a single file.',
      },
      {
        path: 'style.css',
        content: `/* ============================================================
   style.css — extra styles for ${title}

   Most styles are already inside index.html in a <style> block.
   Add any additional overrides or new component styles here.
   ============================================================ */

/* Example: smooth scrolling for anchor links */
html {
    scroll-behavior: smooth;
}

/* Example: focus outlines for keyboard accessibility */
:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 3px;
}
`,
        explanation: 'A CSS file for any extra styles you want to add. The main styles live inside index.html for simplicity.',
      },
      {
        path: 'script.js',
        content: `// ============================================================
// script.js — interactive behaviour for ${title}
// ============================================================

// Wait for the HTML to fully load before running any code.
// This is best practice so we never try to manipulate elements
// that don't exist yet.
document.addEventListener('DOMContentLoaded', () => {
    console.log('${title} loaded successfully!');

    // ── Smooth scroll for nav links ──────────────────────────
    // When a user clicks a nav link like "#about", scroll
    // smoothly instead of jumping straight to that section.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Project card click effect ────────────────────────────
    // Give project cards a subtle "pulse" animation on click
    // to make the page feel alive.
    document.querySelectorAll('.project-card').forEach((card) => {
        card.addEventListener('click', () => {
            card.style.transition = 'transform 0.1s';
            card.style.transform = 'scale(0.97)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    // ── Fade-in on scroll ────────────────────────────────────
    // Use IntersectionObserver to fade sections in as the user
    // scrolls down. This is a popular modern technique.
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target); // stop watching once visible
                }
            });
        },
        { threshold: 0.12 }
    );

    // Apply initial hidden state and observe each section
    document.querySelectorAll('section').forEach((section) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(24px)';
        section.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        observer.observe(section);
    });
});
`,
        explanation: 'The JavaScript file — it adds smooth scrolling, card click effects, and fade-in animations as you scroll down the page.',
      },
    ]

    send(this.ws, {
      type: 'code_generated',
      files,
      explanation: `Generated a complete portfolio site for "${description}" with a hero, about, and projects section.`,
    })

    return files
  }
}
