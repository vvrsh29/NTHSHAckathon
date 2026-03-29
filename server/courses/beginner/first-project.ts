import type { PhaseDefinition } from '../../../shared/types.js'

interface TopicConfig {
  folderName: string
  projectDesc: string
  claudePrompt: string
  magicExplanation: string
  openExplanation: string
  iteratePrompt: string
  iterateExplanation: string
}

const TOPIC_CONFIGS: Record<string, TopicConfig> = {
  'portfolio-site': {
    folderName: 'my-portfolio',
    projectDesc: 'a personal portfolio website',
    claudePrompt: 'claude "create a personal portfolio website with HTML, CSS, and JavaScript. Include an about me section, a projects section, and a contact form. Make it look modern with a dark theme."',
    magicExplanation:
      "This is it — the moment everything comes together! You're about to ask Claude Code to build a personal portfolio site for you. Watch as it creates files, writes code, and explains what it's doing. This might take a minute — that's normal, it's thinking!",
    openExplanation:
      "Time to see your creation! This command opens `index.html` in your default web browser. You should see a fully working portfolio site — with sections for your bio, projects, and contact info. You built this!",
    iteratePrompt: 'claude "add smooth scroll animations and a skills section with progress bars"',
    iterateExplanation:
      "This is the real power of Claude Code — you can **iterate**! Ask it to change things, add features, or fix bugs. It's like having a conversation with your code. Let's add some animations and a skills section.",
  },
  'todo-app': {
    folderName: 'my-todo-app',
    projectDesc: 'a task manager app',
    claudePrompt: 'claude "create a simple todo app with HTML, CSS, and JavaScript. Make it look modern with a dark theme."',
    magicExplanation:
      "This is it — the moment everything comes together! You're about to ask Claude Code to build a whole todo app for you. Watch as it creates files, writes code, and explains what it's doing. This might take a minute — that's normal, it's thinking!",
    openExplanation:
      "Time to see your creation! This command opens `index.html` in your default web browser. You should see a fully working todo app — with a dark theme and everything. You built this!",
    iteratePrompt: 'claude "add a button that toggles dark mode and light mode"',
    iterateExplanation:
      "This is the real power of Claude Code — you can **iterate**! Ask it to change things, add features, or fix bugs. It's like having a conversation with your code. Let's add a dark/light mode toggle.",
  },
  'weather-page': {
    folderName: 'my-weather-app',
    projectDesc: 'a weather dashboard',
    claudePrompt: 'claude "create a weather dashboard with HTML, CSS, and JavaScript. Show a search box for city names, display current weather with a nice card layout, and include a 5-day forecast section. Use a modern dark theme. Use placeholder data since we don\'t have an API key."',
    magicExplanation:
      "This is it — the moment everything comes together! You're about to ask Claude Code to build a weather dashboard for you. Watch as it creates files, writes code, and explains what it's doing. This might take a minute — that's normal, it's thinking!",
    openExplanation:
      "Time to see your creation! This command opens `index.html` in your default web browser. You should see a weather dashboard with a search bar, current conditions, and a forecast section. You built this!",
    iteratePrompt: 'claude "add animated weather icons and a toggle between Celsius and Fahrenheit"',
    iterateExplanation:
      "This is the real power of Claude Code — you can **iterate**! Ask it to change things, add features, or fix bugs. It's like having a conversation with your code. Let's add animated icons and a temperature unit toggle.",
  },
}

const DEFAULT_TOPIC = 'todo-app'

export function getFirstProjectPhase(topic?: string): PhaseDefinition {
  const config = TOPIC_CONFIGS[topic || ''] || TOPIC_CONFIGS[DEFAULT_TOPIC]

  return {
    id: 'first-project',
    title: 'Your First Project',
    description: `Build ${config.projectDesc} with Claude Code`,
    steps: [
      {
        id: 'create-project-dir',
        phase: 'first-project',
        title: 'Create Your Project Folder',
        explanation:
          `Every project lives in its own folder to keep things organized. Let's create one called \`${config.folderName}\` and move inside it. The **&&** lets you run two commands in a row — first \`mkdir\` to create the folder, then \`cd\` to go inside it.`,
        command: `mkdir ${config.folderName} && cd ${config.folderName}`,
        expectedOutputPattern: config.folderName,
        errorPatterns: ['File exists', 'cannot create'],
      },
      {
        id: 'run-claude-code',
        phase: 'first-project',
        title: 'The Magic Moment',
        explanation: config.magicExplanation,
        command: config.claudePrompt,
        expectedOutputPattern: '(Created|Modified|Wrote|Done|complete)',
      },
      {
        id: 'see-files',
        phase: 'first-project',
        title: 'See What Claude Built',
        explanation:
          "Let's see what Claude Code created! Use `ls` to list the files in your project. You should see HTML, CSS, and JavaScript files — everything a web app needs.",
        command: 'ls',
        expectedOutputPattern: '\\.html',
      },
      {
        id: 'open-project',
        phase: 'first-project',
        title: 'Open in Your Browser',
        explanation: config.openExplanation,
        command: 'open index.html',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'iterate',
        phase: 'first-project',
        title: 'Make Changes with AI',
        explanation: config.iterateExplanation,
        command: config.iteratePrompt,
        expectedOutputPattern: '(Created|Modified|Done|complete)',
      },
      {
        id: 'review',
        phase: 'first-project',
        title: 'Read the Code',
        explanation:
          "Take a look at the code Claude Code wrote. You can read through it, understand it, and learn from it. Don't worry if you don't understand everything yet — the point is that you can **see** what's happening. This is how real developers work with AI: generate, review, learn, iterate.",
        command: 'cat index.html',
        expectedOutputPattern: '<',
      },
    ],
  }
}
