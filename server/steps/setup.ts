import type { PhaseDefinition } from './types.js'

export function getSetupPhase(projectName: string): PhaseDefinition {
  return {
    id: 'setup',
    title: 'Setup',
    description: 'Get comfortable with the terminal and create your project folder',
    steps: [
      {
        id: 'setup-welcome',
        phase: 'setup',
        title: 'Welcome to the Terminal!',
        explanation:
          'The terminal is a text-based way to talk to your computer. Instead of clicking icons, you type commands and press Enter. Every command is just a short instruction — like telling your computer "make a folder" or "show me what\'s here". Try not to be intimidated — you\'ll be a pro by the end of this!',
      },
      {
        id: 'setup-mkdir',
        phase: 'setup',
        title: 'Create Your Project Folder',
        command: `mkdir ${projectName}`,
        explanation: `The \`mkdir\` command stands for "make directory" — it creates a new folder. We're creating a folder called \`${projectName}\` to keep all your website files organised. If the command works, nothing will be printed — that's normal! Silence means success in the terminal.`,
        expectedOutputPattern: '\\$\\s*$',
        errorPatterns: ['File exists', 'cannot create', 'mkdir:'],
      },
      {
        id: 'setup-cd',
        phase: 'setup',
        title: 'Go Into Your Folder',
        command: `cd ${projectName}`,
        explanation: `\`cd\` stands for "change directory". It moves you into a folder — like double-clicking a folder to open it. After this command your prompt should change to show you're inside \`${projectName}\`.`,
        expectedOutputPattern: `${projectName}`,
        errorPatterns: ['No such file or directory', 'not a directory'],
      },
      {
        id: 'setup-pwd',
        phase: 'setup',
        title: 'Confirm Your Location',
        command: 'pwd',
        explanation: '`pwd` stands for "print working directory" — it shows you exactly where you are in the file system, like checking your location on a map. You should see a path that ends with your project folder name.',
        expectedOutputPattern: `${projectName}\\s*$`,
        errorPatterns: [],
      },
    ],
  }
}
