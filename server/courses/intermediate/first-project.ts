import type { PhaseDefinition } from '../../../shared/types.js'

interface TopicConfig {
  folderName: string
  projectDesc: string
  introExplanation: string
  claudeExplanation: string
  claudeCommand: string
  iterateExplanation: string
  runExplanation: string
}

const TOPIC_CONFIGS: Record<string, TopicConfig> = {
  'cli-tool': {
    folderName: 'my-cli-tool',
    projectDesc: 'a command-line utility',
    introExplanation:
      "You're going to build a CLI tool — a command-line utility that runs in the terminal. Think file converters, task runners, or data processors. Claude Code is great at building these because it understands terminal workflows natively.",
    claudeExplanation:
      'Start Claude Code in interactive mode. Ask it to build a CLI tool — be specific about what it should do. For example: "build a CLI tool that converts markdown files to HTML" or "build a file organizer that sorts files by type".',
    claudeCommand: 'claude',
    iterateExplanation:
      "Once Claude Code creates your initial CLI tool, try iterating:\n\n- Ask it to **add flags** — \"add a --verbose flag for detailed output\"\n- Ask it to **handle errors** — \"add better error messages when the file doesn't exist\"\n- Ask it to **add features** — \"add support for batch processing multiple files\"\n- Ask it to **write tests** — \"add tests for the main command\"\n\nEach request builds on your existing code. Claude Code understands your whole project.",
    runExplanation:
      "Run your CLI tool! Depending on what you built:\n\n- **Node.js CLI:** `node index.js` or `npm start`\n- **Python CLI:** `python3 main.py`\n- **With arguments:** `node index.js --help` to see available options\n\nIf something doesn't work, ask Claude Code to help debug it — that's part of the workflow.",
  },
  'rest-api': {
    folderName: 'my-api',
    projectDesc: 'a backend API with Express',
    introExplanation:
      "You're going to build a REST API — a backend server that other apps can talk to. APIs are the backbone of modern software. Claude Code can scaffold an Express server with routes, middleware, and data handling in minutes.",
    claudeExplanation:
      'Start Claude Code in interactive mode. Ask it to build an API — be specific about the resources and endpoints. For example: "build a REST API for a bookstore with CRUD endpoints for books and authors" or "build a task management API with Express".',
    claudeCommand: 'claude',
    iterateExplanation:
      "Once Claude Code creates your API, try iterating:\n\n- Ask it to **add endpoints** — \"add a search endpoint that filters by title\"\n- Ask it to **add validation** — \"add input validation for the create endpoint\"\n- Ask it to **add middleware** — \"add request logging middleware\"\n- Ask it to **write tests** — \"add unit tests for the API endpoints\"\n\nEach request builds on your existing code. Claude Code understands your whole project.",
    runExplanation:
      "Run your API server!\n\n- **Start the server:** `npm start` or `node index.js`\n- **Test an endpoint:** `curl http://localhost:3000/api/items`\n- **With a POST:** `curl -X POST -H 'Content-Type: application/json' -d '{\"name\":\"test\"}' http://localhost:3000/api/items`\n\nIf something doesn't work, ask Claude Code to help debug it — that's part of the workflow.",
  },
  'markdown-blog': {
    folderName: 'my-blog',
    projectDesc: 'a static blog generator',
    introExplanation:
      "You're going to build a static blog generator — a tool that converts Markdown files into a beautiful HTML blog. This is a classic developer project that combines file I/O, templating, and HTML/CSS. Claude Code can build the whole pipeline for you.",
    claudeExplanation:
      'Start Claude Code in interactive mode. Ask it to build a blog generator — for example: "build a static blog generator that converts markdown files in a posts/ folder into a styled HTML blog with an index page".',
    claudeCommand: 'claude',
    iterateExplanation:
      "Once Claude Code creates your blog generator, try iterating:\n\n- Ask it to **add features** — \"add syntax highlighting for code blocks\"\n- Ask it to **improve styling** — \"make the blog responsive with a dark mode\"\n- Ask it to **add metadata** — \"parse frontmatter for title, date, and tags\"\n- Ask it to **add an RSS feed** — \"generate an RSS feed from the posts\"\n\nEach request builds on your existing code. Claude Code understands your whole project.",
    runExplanation:
      "Run your blog generator!\n\n- **Build the blog:** `node build.js` or `npm run build`\n- **View it:** `open dist/index.html` or `python3 -m http.server -d dist`\n- **Add a post:** Create a new `.md` file in the posts folder and rebuild\n\nIf something doesn't work, ask Claude Code to help debug it — that's part of the workflow.",
  },
}

const DEFAULT_TOPIC = 'cli-tool'

export function getIntermediateProjectPhase(topic?: string): PhaseDefinition {
  const config = TOPIC_CONFIGS[topic || ''] || TOPIC_CONFIGS[DEFAULT_TOPIC]

  return {
    id: 'intermediate-project',
    title: 'Build with Claude Code',
    description: `Build ${config.projectDesc} using Claude Code`,
    steps: [
      {
        id: 'choose-project',
        phase: 'intermediate-project',
        title: 'What You\'re Building',
        explanation: config.introExplanation,
      },
      {
        id: 'create-dir',
        phase: 'intermediate-project',
        title: 'Create Your Project Folder',
        explanation:
          `Create a directory called \`${config.folderName}\` for your project and move into it.`,
        command: `mkdir ${config.folderName} && cd ${config.folderName}`,
        expectedOutputPattern: config.folderName,
        errorPatterns: ['File exists'],
      },
      {
        id: 'use-claude',
        phase: 'intermediate-project',
        title: 'Start Claude Code',
        explanation: config.claudeExplanation,
        command: config.claudeCommand,
        expectedOutputPattern: '(claude|>|\\$)',
      },
      {
        id: 'iterate',
        phase: 'intermediate-project',
        title: 'Iterate and Refine',
        explanation: config.iterateExplanation,
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
        explanation: config.runExplanation,
      },
    ],
  }
}
