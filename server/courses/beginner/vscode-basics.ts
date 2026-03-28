import type { PhaseDefinition, EnvDetectionResult, Step } from '../../../shared/types.js'

export function getVscodePhase(env: EnvDetectionResult): PhaseDefinition {
  const steps: Step[] = []

  // Step 1: Explain VS Code
  if (env.vscode.installed) {
    steps.push({
      id: 'explain-vscode',
      phase: 'vscode-basics',
      title: 'Your Code Editor',
      explanation:
        "**VS Code** (Visual Studio Code) is the most popular code editor in the world, and it's already installed on your machine! It's where you'll read and edit code. Claude Code works great alongside it — you can have Claude write code in the terminal while you view and tweak it in VS Code.",
    })
  } else {
    steps.push({
      id: 'explain-vscode',
      phase: 'vscode-basics',
      title: 'Your Code Editor',
      explanation:
        "**VS Code** (Visual Studio Code) is the most popular code editor in the world — and it's completely free. It's where you'll read and edit code. Claude Code works great alongside it.\n\nWe recommend downloading it from **code.visualstudio.com**. Install it, then come back here to continue.",
    })
  }

  // Step 2: Open VS Code from terminal (if installed)
  if (env.vscode.installed) {
    steps.push({
      id: 'open-vscode',
      phase: 'vscode-basics',
      title: 'Open VS Code from the Terminal',
      explanation:
        "Here's a neat trick — you can open VS Code right from the terminal! The `code` command followed by a dot (`.`) means \"open VS Code in the current folder.\" This is how most developers open their projects.",
      command: 'code .',
      expectedOutputPattern: '\\$',
    })
  }

  // Step 3: VS Code terminal tip
  steps.push({
    id: 'vscode-terminal',
    phase: 'vscode-basics',
    title: 'The Built-in Terminal',
    explanation:
      env.platform === 'macos'
        ? "Did you know VS Code has a built-in terminal? Press **Cmd+`** (that's the backtick key, above Tab) to open it. You can run all the same commands you've been learning right inside VS Code! Many developers do all their work — editing code and running commands — without ever leaving VS Code."
        : "Did you know VS Code has a built-in terminal? Press **Ctrl+`** (that's the backtick key, above Tab) to open it. You can run all the same commands you've been learning right inside VS Code! Many developers do all their work — editing code and running commands — without ever leaving VS Code.",
  })

  return {
    id: 'vscode-basics',
    title: 'Code Editor',
    description: 'Get to know your code editor',
    steps,
  }
}
