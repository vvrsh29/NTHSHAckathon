import type { PhaseDefinition } from '../../../shared/types.js'

export function getIntermediateProjectPhase(): PhaseDefinition {
  return {
    id: 'intermediate-project',
    title: 'Build with Claude Code',
    description: 'Create a real project using Claude Code',
    steps: [
      {
        id: 'choose-project',
        phase: 'intermediate-project',
        title: 'Choose What to Build',
        explanation:
          "Time to build something real. Think about what you'd like to create — a web app, a CLI tool, a game, an API. Claude Code can handle it all. The more specific your idea, the better the result. If you're not sure, that's fine — you can start with something simple and iterate.",
      },
      {
        id: 'create-dir',
        phase: 'intermediate-project',
        title: 'Create Your Project Folder',
        explanation:
          "Create a directory for your project and move into it. Replace `my-project` with whatever you'd like to call it.",
        command: 'mkdir my-project && cd my-project',
        expectedOutputPattern: 'my-project',
        errorPatterns: ['File exists'],
      },
      {
        id: 'use-claude',
        phase: 'intermediate-project',
        title: 'Start Claude Code',
        explanation:
          'Start Claude Code in interactive mode. Describe what you want to build — be specific about features, tech stack, and design preferences. Claude Code will create files, write code, and explain its decisions.',
        command: 'claude',
        expectedOutputPattern: '(claude|>|\\$)',
      },
      {
        id: 'iterate',
        phase: 'intermediate-project',
        title: 'Iterate and Refine',
        explanation:
          "Once Claude Code creates your initial project, the real fun begins. Try these:\n\n- Ask it to **add features** — \"add user authentication\" or \"add a dark mode\"\n- Ask it to **explain code** — \"explain how the routing works\"\n- Ask it to **fix bugs** — \"the form doesn't submit properly, fix it\"\n- Ask it to **write tests** — \"add unit tests for the API endpoints\"\n\nEach request builds on your existing code. Claude Code understands your whole project.",
      },
      {
        id: 'explore-files',
        phase: 'intermediate-project',
        title: 'Explore Your Project',
        explanation:
          "Check out everything Claude Code created. The `-la` flag shows **all** files (including hidden ones like `.gitignore`) with details like file sizes and dates.",
        command: 'ls -la',
        expectedOutputPattern: '.',
      },
      {
        id: 'run-project',
        phase: 'intermediate-project',
        title: 'Run Your Project',
        explanation:
          "Run your project! Depending on what you built:\n\n- **Web app (HTML/CSS/JS):** `open index.html` or `python3 -m http.server`\n- **Node.js app:** `node index.js` or `npm start`\n- **Python app:** `python3 main.py`\n- **React/Vite app:** `npm run dev`\n\nIf something doesn't work, ask Claude Code to help debug it — that's part of the workflow.",
      },
    ],
  }
}
