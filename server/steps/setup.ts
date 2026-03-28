import type { PhaseDefinition } from './types.js'

export function getSetupPhase(projectName: string): PhaseDefinition {
  return {
    id: 'setup',
    title: 'Setup',
    description: 'Set up your development environment',
    steps: [
      {
        id: 'setup-welcome',
        phase: 'setup',
        title: 'Welcome to the Terminal!',
        explanation:
          'The terminal is a text-based way to talk to your computer. Instead of clicking icons, you type commands. It might look intimidating, but every command is just a short instruction — like telling your computer "make a folder" or "go into this folder".',
      },
      {
        id: 'setup-mkdir',
        phase: 'setup',
        title: 'Create Your Project Folder',
        command: `mkdir ${projectName}`,
        explanation: `Let's create a folder for your project. The \`mkdir\` command stands for "make directory" — it's like right-clicking your desktop and choosing "New Folder", but using text.`,
        expectedOutputPattern: '\\$',
        errorPatterns: ['File exists', 'cannot create'],
      },
      {
        id: 'setup-cd',
        phase: 'setup',
        title: 'Go Into Your Folder',
        command: `cd ${projectName}`,
        explanation:
          '`cd` stands for "change directory". It\'s how you move into a folder. Think of it like double-clicking a folder to open it.',
        expectedOutputPattern: projectName,
        errorPatterns: ['No such file or directory'],
      },
      {
        id: 'setup-ls',
        phase: 'setup',
        title: 'Look Around',
        command: 'ls',
        explanation:
          '`ls` lists the files in your current folder. Right now it should be empty since we just created it. That\'s about to change!',
        expectedOutputPattern: '\\$',
      },
    ],
  }
}
