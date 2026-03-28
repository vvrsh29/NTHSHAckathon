# LaunchPad

A locally-hosted web app that teaches beginners to code by wrapping a real terminal in a guided two-panel UI. Left panel: real terminal in the browser (node-pty + xterm.js). Right panel: AI mentor powered by Claude that explains what's happening in plain language.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set your Anthropic API key**
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Start the app**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

## Architecture

- **Server** (`server/`): Express + WebSocket on port 3456, node-pty shell spawner, step engine (state machine), mentor engine (Claude API streaming), code generator
- **Client** (`client/`): React 19 + Vite + Tailwind CSS, xterm.js terminal, streaming mentor chat panel
- **Shared** (`shared/types.ts`): WebSocket message type contract between client and server

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, ws, node-pty, @anthropic-ai/sdk |
| Frontend | React 19, Vite, xterm.js, Tailwind CSS v4, Framer Motion |
| Language | TypeScript (strict) |
| AI | Claude claude-sonnet-4-20250514 |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Your Anthropic API key (required for AI features) |
| `PORT` | `3456` | Backend server port |
| `PROJECT_DIR` | `~/launchpad-projects` | Where generated projects are saved |

## Development

```bash
npm run dev          # Start both server + client
npm run dev:server   # Server only (port 3456)
npm run dev:client   # Client only (port 5173)
npm run typecheck    # TypeScript type check
```
