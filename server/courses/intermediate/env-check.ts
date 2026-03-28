import type { PhaseDefinition, EnvDetectionResult, Step } from '../../../shared/types.js'

export function getEnvCheckPhase(env: EnvDetectionResult): PhaseDefinition {
  const steps: Step[] = []

  // Intro step
  steps.push({
    id: 'env-check-intro',
    phase: 'env-check',
    title: 'Environment Check',
    explanation:
      "Let's quickly check your development environment. We'll verify you have the tools needed for Claude Code. This should only take a moment.",
  })

  // Check each tool — add install guidance for missing ones, verify steps for present ones
  if (!env.git.installed) {
    steps.push({
      id: 'install-git',
      phase: 'env-check',
      title: 'Git is Missing',
      explanation:
        env.platform === 'macos'
          ? '**Git** is required but not installed. On macOS, run `xcode-select --install` to install it along with other developer tools. Alternatively, install via Homebrew: `brew install git`.'
          : '**Git** is required but not installed. Install it with your package manager: `sudo apt install git -y`.',
      command: env.platform === 'macos' ? 'xcode-select --install' : 'sudo apt install git -y',
      expectedOutputPattern: 'install|git',
      errorPatterns: ['already installed'],
    })
  } else {
    steps.push({
      id: 'verify-git',
      phase: 'env-check',
      title: 'Git',
      explanation: `**Git** ${env.git.version ?? ''} is installed.`,
      command: 'git --version',
      expectedOutputPattern: 'git version',
    })
  }

  if (!env.node.installed) {
    steps.push({
      id: 'install-node',
      phase: 'env-check',
      title: 'Node.js is Missing',
      explanation:
        '**Node.js** is required for Claude Code. Install the LTS version from **nodejs.org**, or use a version manager like `nvm`. On macOS with Homebrew: `brew install node`.',
      command: env.platform === 'macos' ? 'brew install node' : undefined,
      expectedOutputPattern: 'node|installed',
    })
  } else {
    steps.push({
      id: 'verify-node',
      phase: 'env-check',
      title: 'Node.js',
      explanation: `**Node.js** ${env.node.version ?? ''} is installed.`,
      command: 'node --version',
      expectedOutputPattern: 'v\\d+',
    })
  }

  if (!env.python.installed) {
    steps.push({
      id: 'install-python',
      phase: 'env-check',
      title: 'Python is Missing',
      explanation:
        "**Python** isn't strictly required for Claude Code, but many projects use it. Install from **python.org/downloads** or via your package manager.",
    })
  }

  // Ready step
  const missing = [
    !env.git.installed && 'Git',
    !env.node.installed && 'Node.js',
  ].filter(Boolean)

  steps.push({
    id: 'env-ready',
    phase: 'env-check',
    title: missing.length === 0 ? 'Environment Ready!' : 'Almost There',
    explanation:
      missing.length === 0
        ? "Your environment is ready! All essential tools are installed. Let's get to the good stuff."
        : `Once you've installed ${missing.join(' and ')}, you'll be ready to continue. Run the install commands above, then move to the next phase.`,
  })

  return {
    id: 'env-check',
    title: 'Environment Check',
    description: 'Verify your development tools are ready',
    steps,
  }
}
