# LaunchPad — TODO

Two agents work in parallel. **Agent A** owns the backend + AI engine. **Agent B** owns the frontend. They share `shared/types.ts` as the contract — Agent A creates it first, Agent B reads it.

**Rule: Do not touch the other agent's files.** If you need something from the other side, add a note in the HANDOFF section at the bottom.

---

## PHASE 1: Foundation (Do first, in order)

### Agent A: Backend + AI

- [ ] **A1. Project init**
  - Create `package.json` with all dependencies (express, ws, node-pty, @anthropic-ai/sdk, typescript, tsx, concurrently, vite, react, react-dom, xterm, xterm-addon-fit, tailwindcss, @types/*)
  - Create `tsconfig.json` (strict mode, ESM)
  - Create `vite.config.ts` (React plugin, proxy `/ws` to backend)
  - Create `.env.example` with `ANTHROPIC_API_KEY`, `PORT=3456`, `PROJECT_DIR`
  - Create `shared/types.ts` with ALL WebSocket message types from CLAUDE.md
  - **Commit and push before doing anything else so Agent B can pull types**

- [ ] **A2. Express + WebSocket server**
  - `server/index.ts` — Express app, upgrade HTTP to WS, serve static in prod
  - Listen on PORT from env, log startup with `[SERVER]` prefix
  - WebSocket connection handler that routes messages by `type` field

- [ ] **A3. PTY Manager**
  - `server/pty-manager.ts`
  - Spawn a real shell (bash/zsh) via node-pty
  - Pipe `terminal_input` WS messages → pty stdin
  - Pipe pty stdout → `terminal_output` WS messages
  - Set initial cwd to PROJECT_DIR
  - Handle resize messages from xterm fit addon
  - Strip ANSI codes helper function for sending clean output to mentor

- [ ] **A4. Verify terminal works**
  - Create a minimal `client/index.html` with inline xterm.js (temporary, Agent B will replace)
  - Confirm: type in browser → command runs → output appears
  - **This is the critical path. Nothing else matters until this works.**

### Agent B: Frontend

- [ ] **B1. Wait for Agent A to commit `shared/types.ts`, then pull**

- [ ] **B2. Vite + React scaffold**
  - `client/index.html` (root div, font imports)
  - `client/main.tsx` (React root render)
  - `client/App.tsx` (shell layout — two panels, no logic yet)
  - `client/styles/globals.css` (Tailwind directives, CSS variables for theme)
  - Tailwind config with dark theme colors
  - Confirm: `npm run dev` shows the two-panel layout in browser

- [ ] **B3. Terminal panel**
  - `client/components/TerminalPanel.tsx`
  - Initialize xterm.js with fit addon
  - Style: dark background, monospace font, proper padding
  - `client/hooks/useWebSocket.ts` — connect to `ws://localhost:3456`
  - `client/hooks/useTerminal.ts` — wire xterm onData → WS `terminal_input`, WS `terminal_output` → xterm.write
  - Handle terminal resize → send resize message to server
  - **Test with Agent A's server: type commands, see output**

- [ ] **B4. Mentor panel (static first)**
  - `client/components/MentorPanel.tsx` — scrollable chat message list
  - `client/hooks/useMentor.ts` — collect `mentor_message` WS events into state
  - Message bubbles styled by messageType (explanation, instruction, encouragement, error_help)
  - Auto-scroll to bottom on new messages
  - Render markdown in messages (code blocks, bold, etc.)

---

## PHASE 2: AI Engine (Agent A) + UI Components (Agent B)

### Agent A: AI Engine

- [ ] **A5. Step types and definitions**
  - `server/steps/types.ts` — Step and Phase interfaces from CLAUDE.md
  - `server/steps/setup.ts` — Steps: explain terminal, mkdir project, cd into it
  - `server/steps/scaffold.ts` — Steps: npm create vite, install deps, explain package.json
  - `server/steps/build.ts` — Steps: AI generates components, explain each file
  - `server/steps/style.ts` — Steps: AI adds Tailwind styling, explain CSS
  - `server/steps/deploy.ts` — Steps: explain deployment, guide through Vercel CLI (stretch goal)

- [ ] **A6. Step Engine**
  - `server/step-engine.ts`
  - State machine: tracks current phase + step index
  - Watches terminal output buffer (debounced 500ms)
  - Matches output against current step's expectedOutputPattern → advance
  - Matches output against errorPatterns → trigger mentor error help
  - Sends `step_update` and `command_suggestion` WS messages
  - Handles `next_step` and `start_project` WS messages from client

- [ ] **A7. Mentor Engine**
  - `server/mentor-engine.ts`
  - Claude API client setup (Anthropic SDK)
  - Mentor system prompt from CLAUDE.md
  - `explainStep(step)` → streams mentor_message to client
  - `explainError(error, terminalOutput)` → streams error_help to client
  - `answerQuestion(question, context)` → streams answer to client
  - Include current step, phase, and recent terminal output as context in every call
  - Retry once on API failure with friendly fallback message

- [ ] **A8. Code Generator**
  - `server/code-generator.ts`
  - Code generation system prompt from CLAUDE.md
  - `generateProjectCode(description, step)` → returns file array
  - `server/project-manager.ts` — writes generated files to disk
  - Sends `code_generated` WS message with file contents + explanations
  - Files written to PROJECT_DIR/[project-name]/

### Agent B: UI Components

- [ ] **B5. Welcome screen**
  - `client/components/WelcomeScreen.tsx`
  - "What do you want to build?" input
  - Suggested templates: Portfolio site, To-do app, Landing page, Blog
  - API key input if not set (with explanation of what it is)
  - Sends `start_project` WS message on submit
  - Animated entrance, polished design — this is the first thing judges see

- [ ] **B6. Step indicator**
  - `client/components/StepIndicator.tsx`
  - Horizontal progress bar showing: Setup → Scaffold → Build → Style → Deploy
  - Current phase highlighted, completed phases checked
  - Responds to `step_update` WS messages

- [ ] **B7. Command prompt component**
  - `client/components/CommandPrompt.tsx`
  - Highlighted code block showing the command to type
  - "Copy to clipboard" button
  - Plain-language explanation below the command
  - Subtle pulse/glow animation to draw attention
  - Responds to `command_suggestion` WS messages

- [ ] **B8. Code explainer**
  - `client/components/CodeExplainer.tsx`
  - Shows generated code with syntax highlighting
  - Inline annotations explaining key sections
  - Collapsible file sections (one per generated file)
  - Responds to `code_generated` WS messages

- [ ] **B9. Question input**
  - Add "Ask me anything" input at bottom of mentor panel
  - Sends `mentor_question` WS message
  - Shows loading state while waiting for response
  - Clear input after sending

---

## PHASE 3: Integration + Polish

### Both Agents

- [ ] **C1. End-to-end flow test**
  - Start server, open browser
  - Type "portfolio site" in welcome screen
  - Verify: mentor explains first step → command suggestion appears → user types it → output detected → next step triggers
  - Walk through ALL phases: setup → scaffold → build → style
  - Fix any WS message mismatches between client and server

- [ ] **C2. Error handling pass**
  - Test: user types wrong command → mentor catches it
  - Test: user types typo → mentor suggests correction
  - Test: npm install fails → mentor explains and gives fix
  - Test: Claude API rate limit / failure → graceful fallback message

- [ ] **C3. UI polish**
  - Smooth transitions between phases
  - Loading states for AI generation ("Your mentor is thinking...")
  - Terminal and mentor panels resize properly
  - Welcome screen → main UI transition is seamless
  - No layout jank, no scroll issues

- [ ] **C4. Demo prep**
  - Test full flow start to finish 3 times
  - Ensure it completes in under 10 minutes
  - Prepare a "demo mode" with a known-good project description
  - Screenshot / record a backup video in case live demo fails

---

## PHASE 4: Intelligence Layer (ForgeFlow Integration)

ForgeFlow is a sub-project that transforms a raw user idea into a structured execution plan, then feeds it into the Step Engine. It lives in `server/forgeflow/` and acts as the "brain" between the welcome screen input and the step-by-step lesson flow.

**Data flow:** User idea (string) → D1 Task Parser → D2 TOML Generator → D3 Env Generator → D4 Template Mapper → D5 File Generator → D6 Step Expander → Step Engine → D7 Mode Switch controls runtime behavior

### Agent A: ForgeFlow Engine

- [ ] **D1. Task Parser**
  - `server/forgeflow/task-parser.ts`
  - Accept raw user input string (e.g. "I want to build a recipe sharing app")
  - Call Claude API to extract structured project JSON:
    ```json
    {
      "name": "recipe-sharing-app",
      "description": "...",
      "type": "web-app",
      "features": ["user profiles", "recipe cards", "search"],
      "techStack": ["html", "css", "js"],
      "estimatedSteps": 8
    }
    ```
  - Validate and sanitize output before passing downstream
  - Emit `plan_parsed` WS message with structured plan

- [ ] **D2. TOML Generator**
  - `server/forgeflow/toml-generator.ts`
  - Transform the parsed JSON plan into a `launch.toml` execution format
  - `launch.toml` defines phases, step order, expected outputs, and error patterns
  - Example output:
    ```toml
    [project]
    name = "recipe-sharing-app"
    type = "web-app"

    [[phases]]
    id = "setup"
    steps = ["mkdir", "cd", "git-init"]

    [[phases]]
    id = "scaffold"
    steps = ["create-index", "create-styles", "create-script"]
    ```
  - Write file to `~/launchpad-projects/[project-name]/launch.toml`
  - Emit `toml_generated` WS message

- [ ] **D3. Env Generator**
  - `server/forgeflow/env-generator.ts`
  - Scan the parsed plan for required environment variables (API keys, ports, config)
  - Generate a `.env.example` with comments explaining each variable
  - Write to `~/launchpad-projects/[project-name]/.env.example`
  - If project needs no env vars, skip silently
  - Emit `env_generated` WS message with list of required vars

- [ ] **D4. Template Mapper**
  - `server/forgeflow/template-mapper.ts`
  - Map `project.type` from the parsed plan to a known template:
    - `"web-app"` → portfolio/landing page template
    - `"tool"` → utility script template
    - `"game"` → simple canvas game template
    - `"api"` → Express REST API template (stretch)
  - Templates defined in `server/forgeflow/templates/` as JSON configs
  - Return template config that D5 and D6 use to generate files and steps
  - Fall back to a generic template if type is unrecognized

- [ ] **D5. File Generator**
  - `server/forgeflow/file-generator.ts`
  - Given the mapped template + parsed plan, generate the starter project structure:
    - Folder structure (e.g. `src/`, `public/`, `styles/`)
    - Starter files (`index.html`, `style.css`, `script.js`) with placeholder content
    - `README.md` with project name, description, and "how to run" instructions
    - `prompts/` folder with a `system-prompt.txt` explaining the project to Claude for later generation steps
  - Write all files to `~/launchpad-projects/[project-name]/`
  - Emit `files_generated` WS message with file tree

- [ ] **D6. Step Expander**
  - `server/forgeflow/step-expander.ts`
  - Convert high-level phase entries from `launch.toml` into fully executable Step objects (matching the Step interface from `server/steps/types.ts`)
  - Each expanded step includes:
    - `command` (exact terminal command to run)
    - `explanation` (mentor message for this step)
    - `expectedOutputPattern` (regex or string to detect completion)
    - `errorPatterns` (array of known failure strings)
  - Feed expanded steps directly into the Step Engine (replacing or augmenting the hardcoded phases)
  - Emit `steps_expanded` WS message with full step list

### Agent B: ForgeFlow UI

- [ ] **D7. Mode Switch**
  - `client/components/ModeSwitch.tsx`
  - Toggle button in the header: **Auto** / **Tutor** mode
  - **Tutor mode** (default): mentor explains every step before it runs, user types commands manually
  - **Auto mode**: Step Engine runs commands automatically via PTY, mentor narrates in real time
  - Sends `mode_change` WS message (`{ mode: "auto" | "tutor" }`) on toggle
  - Server Step Engine and Mentor Engine respect the current mode:
    - Tutor: send `command_suggestion`, wait for user to type
    - Auto: write command directly to PTY, stream mentor explanation simultaneously
  - Persist mode preference in `localStorage`
  - Visual indicator in terminal panel showing current mode

---

## HANDOFF NOTES

Agent A and Agent B: leave notes here when you need something from the other side.

```
[AGENT A → AGENT B] (timestamp)
Message here

[AGENT B → AGENT A] (timestamp)
Message here
```

---

## DEPENDENCIES

All packages needed (Agent A installs these in A1):

**Backend:**
- express
- ws
- node-pty
- @anthropic-ai/sdk
- dotenv
- strip-ansi
- @iarna/toml (for launch.toml generation)

**Frontend:**
- react, react-dom
- @xterm/xterm, @xterm/addon-fit
- react-markdown (for mentor messages)
- lucide-react (icons)

**Dev:**
- typescript
- tsx
- vite
- @vitejs/plugin-react
- tailwindcss
- @tailwindcss/vite
- concurrently
- @types/express, @types/ws, @types/react, @types/react-dom

---

## QUICK REFERENCE

**Start dev:** `npm run dev`
**Server port:** 3456
**WebSocket:** `ws://localhost:3456/ws`
**Frontend dev:** Vite on port 5173, proxies /ws to 3456
**Project files created in:** `~/launchpad-projects/`
**Claude model:** `claude-sonnet-4-20250514`
