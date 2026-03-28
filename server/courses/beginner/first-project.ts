import type { PhaseDefinition } from '../../../shared/types.js'

export function getFirstProjectPhase(): PhaseDefinition {
  return {
    id: 'first-project',
    title: 'Your First Project',
    description: 'Build something real with Claude Code',
    steps: [
      {
        id: 'create-project-dir',
        phase: 'first-project',
        title: 'Create Your Project Folder',
        explanation:
          "Every project lives in its own folder to keep things organized. Let's create one called `my-first-app` and move inside it. The **&&** lets you run two commands in a row — first `mkdir` to create the folder, then `cd` to go inside it.",
        command: 'mkdir my-first-app && cd my-first-app',
        expectedOutputPattern: 'my-first-app',
        errorPatterns: ['File exists', 'cannot create'],
      },
      {
        id: 'run-claude-code',
        phase: 'first-project',
        title: 'The Magic Moment',
        explanation:
          "This is it — the moment everything comes together! You're about to ask Claude Code to build a whole todo app for you. Watch as it creates files, writes code, and explains what it's doing. This might take a minute — that's normal, it's thinking!",
        command: 'claude "create a simple todo app with HTML, CSS, and JavaScript. Make it look modern with a dark theme."',
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
        explanation:
          "Time to see your creation! This command opens `index.html` in your default web browser. You should see a fully working todo app — with a dark theme and everything. You built this!",
        command: 'open index.html',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'iterate',
        phase: 'first-project',
        title: 'Make Changes with AI',
        explanation:
          "This is the real power of Claude Code — you can **iterate**! Ask it to change things, add features, or fix bugs. It's like having a conversation with your code. Let's add a dark/light mode toggle.",
        command: 'claude "add a button that toggles dark mode and light mode"',
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
