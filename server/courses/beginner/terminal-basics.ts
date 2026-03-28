import type { PhaseDefinition } from '../../../shared/types.js'

export function getTerminalBasicsPhase(): PhaseDefinition {
  return {
    id: 'terminal-basics',
    title: 'Terminal Basics',
    description: 'Learn the fundamental terminal commands every developer uses',
    steps: [
      {
        id: 'pwd',
        phase: 'terminal-basics',
        title: 'Where Am I?',
        explanation:
          '**pwd** (print working directory) shows your current folder path. Think of it as asking "where am I right now?" — the terminal tells you the full path.',
        command: 'pwd',
        expectedOutputPattern: '\\/',
      },
      {
        id: 'ls',
        phase: 'terminal-basics',
        title: "What's in This Folder?",
        explanation:
          '**ls** lists everything in the current folder — files and directories. Like opening a folder on your desktop, but as text.',
        command: 'ls',
        expectedOutputPattern: '\\w',
      },
      {
        id: 'mkdir',
        phase: 'terminal-basics',
        title: 'Create a Folder',
        explanation:
          '**mkdir** (make directory) creates a new folder. No output means success — silence is golden in the terminal.',
        command: 'mkdir launchpad-playground',
        expectedOutputPattern: '\\$',
        errorPatterns: ['File exists', 'cannot create', 'mkdir:'],
      },
      {
        id: 'cd-into',
        phase: 'terminal-basics',
        title: 'Go Inside',
        explanation:
          '**cd** (change directory) moves you into a folder — like double-clicking to open it. Your prompt will update to show the new location.',
        command: 'cd launchpad-playground',
        expectedOutputPattern: '(launchpad-playground|\\$)',
        errorPatterns: ['No such file or directory', 'not a directory'],
      },
      {
        id: 'ls-la',
        phase: 'terminal-basics',
        title: 'See Everything',
        explanation:
          '**ls -la** shows all files including hidden ones (starting with `.`), plus permissions and sizes. The `-l` flag means long format, `-a` means all files.',
        command: 'ls -la',
        expectedOutputPattern: 'total',
      },
      {
        id: 'touch',
        phase: 'terminal-basics',
        title: 'Create a File',
        explanation:
          '**touch** creates an empty file. No output means it worked. You now have a blank `hello.txt` ready to fill.',
        command: 'touch hello.txt',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'echo-write',
        phase: 'terminal-basics',
        title: 'Write to a File',
        explanation:
          '**echo** prints text, and **>** redirects it into a file. Think of `>` as an arrow pointing text into `hello.txt`.',
        command: 'echo "Hello, world!" > hello.txt',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'cat',
        phase: 'terminal-basics',
        title: 'Read a File',
        explanation:
          '**cat** displays file contents in the terminal. You should see the text you just wrote — you created, wrote, and read a file from the command line!',
        command: 'cat hello.txt',
        expectedOutputPattern: 'Hello',
      },
      {
        id: 'clear',
        phase: 'terminal-basics',
        title: 'Clean Your Terminal',
        explanation:
          '**clear** wipes the terminal screen. Your files and history are still there — it just gives you a fresh view. Great for decluttering.',
        command: 'clear',
        expectedOutputPattern: '\\$',
      },
      {
        id: 'history',
        phase: 'terminal-basics',
        title: 'See Your Command History',
        explanation:
          '**history** shows every command you have typed. Handy when you want to repeat something or remember what you did. You can also press the up arrow to cycle through past commands.',
        command: 'history',
        expectedOutputPattern: '\\d+',
      },
    ],
  }
}
