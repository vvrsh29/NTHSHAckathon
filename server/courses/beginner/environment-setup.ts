import type { PhaseDefinition, EnvDetectionResult, Step } from '../../../shared/types.js'

export function getEnvSetupPhase(env: EnvDetectionResult): PhaseDefinition {
  const steps: Step[] = []

  // --- Xcode CLT (macOS only) ---
  if (env.platform === 'macos' && !env.xcodeClT.installed) {
    steps.push({
      id: 'install-xcode-clt',
      phase: 'env-setup',
      title: 'Install Xcode Command Line Tools',
      explanation:
        "On macOS, many developer tools depend on Apple's **Xcode Command Line Tools**. This installs a C compiler and other essentials that tools like Git need behind the scenes. A dialog box will pop up — click **Install** and wait for it to finish. This can take a few minutes.",
      command: 'xcode-select --install',
      expectedOutputPattern: 'install requested|already installed',
      errorPatterns: ['already installed'],
    })
  }

  // --- Git ---
  if (!env.git.installed) {
    if (env.platform === 'macos') {
      steps.push({
        id: 'install-git',
        phase: 'env-setup',
        title: 'Install Git',
        explanation:
          "**Git** is the tool developers use to save snapshots of their code — like a time machine for your projects. On macOS, installing Xcode Command Line Tools (above) usually installs Git too. If you already ran that step, Git may already be ready. Let's check!",
        command: 'git --version',
        expectedOutputPattern: 'git version',
        errorPatterns: ['not found', 'No developer tools'],
      })
    } else {
      steps.push({
        id: 'install-git',
        phase: 'env-setup',
        title: 'Install Git',
        explanation:
          "**Git** is the tool developers use to save snapshots of their code — like a time machine for your projects. Let's install it using your system's package manager.",
        command: 'sudo apt install git -y',
        expectedOutputPattern: 'git version|is already the newest',
        errorPatterns: ['Unable to locate', 'permission denied'],
      })
    }
    steps.push({
      id: 'verify-git',
      phase: 'env-setup',
      title: 'Verify Git',
      explanation:
        "Let's confirm Git is installed and working. You should see a version number — that means it's ready to go!",
      command: 'git --version',
      expectedOutputPattern: 'git version',
    })
  } else {
    steps.push({
      id: 'verify-git',
      phase: 'env-setup',
      title: 'Git is Ready!',
      explanation:
        `Great news — **Git** is already installed! You're running version ${env.git.version ?? 'unknown'}. One less thing to worry about. Let's verify it real quick.`,
      command: 'git --version',
      expectedOutputPattern: 'git version',
    })
  }

  // --- Node.js ---
  if (!env.node.installed) {
    steps.push({
      id: 'explain-node',
      phase: 'env-setup',
      title: 'Why We Need Node.js',
      explanation:
        "**Node.js** lets you run JavaScript outside the browser. It powers a huge number of developer tools — including Claude Code. Without it, we can't install or run Claude Code. Let's get it set up.",
    })
    if (env.platform === 'macos') {
      steps.push({
        id: 'install-node',
        phase: 'env-setup',
        title: 'Install Node.js',
        explanation:
          "The easiest way to install Node.js on macOS is from the official website. Visit **nodejs.org** and download the **LTS** (Long Term Support) version — it's the big green button. Run the installer, then come back here.\n\nAlternatively, if you have Homebrew installed, you can run: `brew install node`",
      })
    } else {
      steps.push({
        id: 'install-node',
        phase: 'env-setup',
        title: 'Install Node.js',
        explanation:
          "Let's install Node.js. The easiest way on Linux is to visit **nodejs.org** and follow the instructions for your distribution, or use your package manager.\n\nAlternatively, you can run: `sudo apt install nodejs npm -y`",
      })
    }
    steps.push({
      id: 'verify-node',
      phase: 'env-setup',
      title: 'Verify Node.js',
      explanation:
        "Let's make sure Node.js is installed correctly. You should see a version number starting with **v** — that means it's working!",
      command: 'node --version',
      expectedOutputPattern: 'v\\d+',
      errorPatterns: ['not found', 'command not found'],
    })
  } else {
    steps.push({
      id: 'verify-node',
      phase: 'env-setup',
      title: 'Node.js is Ready!',
      explanation:
        `**Node.js** is already installed — version ${env.node.version ?? 'unknown'}. This is what powers Claude Code and thousands of other dev tools. Let's verify it.`,
      command: 'node --version',
      expectedOutputPattern: 'v\\d+',
    })
  }

  // --- Python ---
  if (!env.python.installed) {
    steps.push({
      id: 'install-python',
      phase: 'env-setup',
      title: 'Install Python',
      explanation:
        "**Python** is one of the most popular programming languages. While Claude Code doesn't require it, many projects and tools you'll encounter will use it. Visit **python.org/downloads** to install it, or on macOS you can run `brew install python3`.",
    })
    steps.push({
      id: 'verify-python',
      phase: 'env-setup',
      title: 'Verify Python',
      explanation:
        "Let's check if Python is available. You should see a version number.",
      command: 'python3 --version',
      expectedOutputPattern: 'Python',
      errorPatterns: ['not found', 'command not found'],
    })
  } else {
    steps.push({
      id: 'verify-python',
      phase: 'env-setup',
      title: 'Python is Ready!',
      explanation:
        `**Python** is already installed — version ${env.python.version ?? 'unknown'}. Nice! This will come in handy for all sorts of projects.`,
      command: 'python3 --version',
      expectedOutputPattern: 'Python',
    })
  }

  // If literally everything was already installed, add a celebration step
  const allInstalled = env.git.installed && env.node.installed && env.python.installed &&
    (env.platform !== 'macos' || env.xcodeClT.installed)
  if (allInstalled) {
    steps.push({
      id: 'env-all-good',
      phase: 'env-setup',
      title: 'Everything is Installed!',
      explanation:
        "Your computer already has all the tools we need. That's fantastic — it means you can jump straight into the fun stuff. Onward!",
    })
  }

  return {
    id: 'env-setup',
    title: 'Environment Setup',
    description: 'Make sure your computer has the developer tools we need',
    steps,
  }
}
