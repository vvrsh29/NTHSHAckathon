# CLAUDE.md — CodeGuide

## Project Overview

CodeGuide is a locally-hosted web app that teaches complete beginners how to use the terminal and build websites with AI assistance. It wraps a real terminal (via node-pty + xterm.js) in a guided two-panel UI: terminal on the left, AI mentor on the right.

**This is a hackathon project. Ship fast, cut scope ruthlessly, but make the demo incredible.**

## Architecture

See ARCHITECTURE.md for the full system design. Key points:

- **Monorepo**: `server/` (Express + node-pty + WebSocket) and `client/` (React + Vite + xterm.js)
- **Two AI call types**: code generation (writes beginner-friendly HTML/CSS/JS) and explanation generation (translates terminal concepts into plain language)
- **Lesson engine**: A state machine that tracks the user through a series of steps (terminal commands, code generation, concept explanations, user inputs, checkpoints)
- **Real terminal**: node-pty spawns an actual shell. The user types real commands that affect their real filesystem.

## Tech Stack

Backend: Node.js, Express, node-pty, ws (WebSockets), @anthropic-ai/sdk
Frontend: React 19, Vite, xterm.js, Tailwind CSS, Framer Motion, Lucide icons

## Commands

- `npm install` — Install all deps (root runs both server + client)
- `npm run dev` — Start both server (port 3001) and client dev server (port 3000) concurrently
- `npm run dev:server` — Start only the backend
- `npm run dev:client` — Start only the frontend
- `cd server && node index.js` — Run server directly
- `cd client && npm run dev` — Run Vite dev server directly

## Code Style

- ES Modules everywhere (import/export, not require)
- Functional React components with hooks, no classes
- Use async/await, never raw .then() chains
- Tailwind for styling — no separate CSS files except for xterm.js overrides
- Name files in PascalCase for components (Terminal.jsx), camelCase for everything else (useTerminal.js)
- Keep components under 150 lines. If bigger, split.

## Key Design Decisions

1. **node-pty, not a fake shell.** The terminal must be real. The user types real commands that create real files. This is non-negotiable — the whole point is teaching them the actual terminal.

2. **Two-panel layout.** Left panel is the terminal (xterm.js). Right panel is the guidance/mentor. The right panel has: current step explanation, a "type this command" hint area, a progress indicator, and an "ask a question" input.

3. **Lesson steps drive everything.** The app is a state machine. The current step determines what the guidance panel shows, what command hints appear, and what the AI generates. Steps advance manually (user clicks "Next" or types the right command).

4. **Plain HTML/CSS/JS for generated projects.** No React, no frameworks, no build tools in the USER's project. The point is teaching fundamentals. The user's first site should be hand-understandable.

5. **Anthropic API, not Claude Code CLI.** We call the Claude API directly for code generation and explanations. This gives us full control over prompts and responses.

6. **Sonnet for speed.** Use claude-sonnet-4-20250514 for all API calls. Explanations need to be fast so the experience feels responsive.

## File Structure

```
codeguide/
├── CLAUDE.md
├── ARCHITECTURE.md
├── package.json                 # Workspace root
├── server/
│   ├── package.json
│   ├── index.js                 # Express + WS entry point
│   ├── routes/
│   │   ├── lesson.js            # Lesson state + progress
│   │   ├── ai.js                # Claude API proxy
│   │   └── project.js           # File tree + contents
│   ├── services/
│   │   ├── claude.js            # Anthropic SDK wrapper
│   │   ├── pty.js               # PTY session manager
│   │   └── lesson-engine.js     # Step state machine
│   ├── lessons/
│   │   └── portfolio.json       # Portfolio site lesson
│   └── ws/
│       └── terminal.js          # WebSocket ↔ PTY bridge
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Terminal.jsx
│   │   │   ├── GuidancePanel.jsx
│   │   │   ├── StepProgress.jsx
│   │   │   ├── FileExplorer.jsx
│   │   │   ├── CommandHint.jsx
│   │   │   ├── CodeViewer.jsx
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── CelebrationScreen.jsx
│   │   │   └── AskQuestion.jsx
│   │   ├── hooks/
│   │   │   ├── useTerminal.js
│   │   │   ├── useLesson.js
│   │   │   └── useAI.js
│   │   ├── context/
│   │   │   └── LessonContext.jsx
│   │   └── styles/
│   │       └── terminal.css
│   └── public/
│       └── favicon.svg
└── README.md
```

## Lesson JSON Format

Each lesson is an array of steps:

```json
{
  "id": "portfolio",
  "title": "Build Your Portfolio Site",
  "description": "Create and deploy your first personal website",
  "steps": [
    {
      "id": "welcome",
      "type": "concept",
      "title": "Welcome!",
      "content": "You're about to build your first website. By the end, it'll be live on the internet for anyone to see. Let's start."
    },
    {
      "id": "get-name",
      "type": "user_input",
      "title": "About You",
      "prompt": "What's your name? (We'll use this on your site)",
      "field": "user_name"
    },
    {
      "id": "make-folder",
      "type": "terminal_command",
      "title": "Create Your Project Folder",
      "command": "mkdir my-portfolio",
      "before": "First, we need a place to put your project files. We'll create a new folder using the terminal. Think of this like right-clicking on your desktop and selecting 'New Folder' — but with typing instead of clicking.",
      "after": "Done! You just created a folder called 'my-portfolio'. You won't see any output — in the terminal, silence means success."
    },
    {
      "id": "cd-folder",
      "type": "terminal_command",
      "title": "Go Into Your Folder",
      "command": "cd my-portfolio",
      "before": "'cd' stands for 'change directory'. It's how you move into a folder in the terminal. Like double-clicking a folder to open it.",
      "after": "You're now inside your project folder. Notice your terminal prompt changed — it shows where you are."
    }
  ]
}
```

## Agent Team Task Breakdown

If using Claude Code Agent Teams, split work as follows:

### Agent 1: Backend Core
- Express server setup with CORS
- WebSocket server for terminal I/O
- node-pty integration (spawn shell, pipe I/O)
- API routes structure

### Agent 2: AI Service + Lesson Engine
- Anthropic SDK integration
- Code generation prompts (beginner-friendly HTML/CSS/JS)
- Explanation generation prompts
- Lesson engine state machine
- Portfolio lesson JSON content

### Agent 3: Frontend Shell
- Vite + React setup with Tailwind
- Two-panel layout (responsive)
- xterm.js terminal component with WebSocket connection
- Routing between welcome screen → lesson → celebration

### Agent 4: Frontend Guidance + Polish
- Guidance panel (step display, explanations, progress)
- Command hint component
- Ask question component
- File explorer component
- Welcome screen and celebration screen
- Animations and visual polish

## Critical Implementation Details

### Terminal ↔ WebSocket Bridge (server/ws/terminal.js)
```javascript
// The PTY output must be forwarded to the client AS-IS
// xterm.js handles all ANSI rendering
// Client sends keystrokes → server writes to PTY
// PTY output → server forwards to client via WS
```

### xterm.js Setup (client/src/components/Terminal.jsx)
```javascript
// Use @xterm/xterm and @xterm/addon-fit
// Connect to ws://localhost:3001/ws/terminal
// On WS message → terminal.write(data)
// On terminal data (user typing) → ws.send(data)
// Call fitAddon.fit() on resize
```

### API Key Handling
The user must set ANTHROPIC_API_KEY as an env var. On startup, check for it and show a clear error message in the UI if missing. Eventually, the welcome screen should have a field for it.

## Priorities for Hackathon

1. **Get the terminal working in the browser first.** This is the hardest technical piece. If node-pty → WebSocket → xterm.js works, everything else is UI.
2. **Build one complete lesson (portfolio site).** Don't build a lesson editor or multiple templates. One polished flow.
3. **Make the guidance panel actually useful.** This is the differentiator. Explanations should be warm, clear, and genuinely helpful.
4. **Polish the demo flow.** The first 30 seconds of the demo sell it. Welcome screen → first command → "whoa it explained what just happened" → judges are hooked.
5. **Deployment step is a stretch goal.** If time is tight, end at "your site is running on localhost" and show the deploy step as a mockup.

## Don'ts

- Don't add TypeScript. This is a hackathon.
- Don't add authentication. It runs locally.
- Don't build multiple lessons. One great one beats three broken ones.
- Don't over-engineer the lesson format. JSON is fine. No database.
- Don't sandbox the terminal. The whole point is it's real.
- Don't make the generated websites use frameworks. Plain HTML/CSS/JS only.
- Don't spend time on error handling edge cases. Focus on the happy path for the demo.

## Name

**CodeGuide** — working name. Open to change.

## One-Liner Pitch

"The training wheels for AI-assisted coding — we don't just build your site, we teach you how."
