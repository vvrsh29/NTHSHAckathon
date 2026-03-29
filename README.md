# LaunchPad

**Learn Claude Code the right way** — a guided, interactive web app that teaches you how to use the terminal and build projects with AI assistance.

LaunchPad wraps a real terminal in a two-panel browser UI. You type real commands on the left; an AI mentor explains what's happening on the right. Three course tracks take you from "what's a terminal?" to CLAUDE.md best practices and MCP integrations.

## What it does

1. **Landing page** with an animated terminal demo showing what Claude Code looks like in action
2. **6-stage onboarding** — name, role, experience level, API key, project idea, confirmation
3. **Three course tracks:**
   - **Beginner** (~30 min) — terminal basics, environment setup, Git/Node/VS Code, install Claude Code, build your first project
   - **Intermediate** (~15 min) — quick env check, jump to Claude Code, build something real, tips & tricks
   - **Advanced** (~10 min) — CLAUDE.md best practices, slash commands, MCP servers, hooks, agent workflows
4. **Dashboard** — resizable terminal + mentor panels, step-by-step guidance, command suggestions, progress tracking
5. **Home screen** — progress ring, phase breakdown, environment status, quick actions, resource links

## Quick Start

**One-line install:**
```bash
curl -fsSL https://raw.githubusercontent.com/vvrsh29/NTHSHAckathon/main/setup.sh | bash
```

**Or manual install:**
```bash
git clone https://github.com/vvrsh29/NTHSHAckathon.git launchpad
cd launchpad
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

| Layer | Stack |
|---|---|
| Server | Node.js, Express, ws, node-pty, SSH (port 2222) |
| Client | React 19, Vite, xterm.js, Tailwind CSS v4, shadcn/ui, Framer Motion |
| AI | Google Gemini (mentor engine) |
| Language | TypeScript (strict, ESM) |

- `server/` — Express + WebSocket server (port 3001), PTY/SSH terminal manager, step engine, mentor engine, course loader, environment detector
- `client/` — React SPA with landing page, onboarding wizard, home dashboard, and learning dashboard (terminal + mentor panels)
- `shared/types.ts` — WebSocket message contract between client and server

## Development

```bash
npm run dev          # Start both server (3001) + client (3000)
npm run dev:server   # Server only
npm run dev:client   # Client only
```

You can also connect to the terminal directly: `ssh localhost -p 2222`

---

## Deploying the Landing Page

The `landing/` directory contains a standalone static page deployable to Vercel:

```bash
cd landing
vercel
```

Or connect the `landing/` directory as the root in Vercel project settings.

---

Built at a hackathon with Claude Code.
