import type { PhaseDefinition, EnvDetectionResult, Step } from '../../../shared/types.js'

export function getInstallClaudeCodePhase(env: EnvDetectionResult): PhaseDefinition {
  const steps: Step[] = []

  // Step 1: Explain what Claude Code is
  steps.push({
    id: 'explain-claude-code',
    phase: 'install-claude-code',
    title: 'What is Claude Code?',
    explanation:
      "**Claude Code** is an AI coding assistant that lives in your terminal. You tell it what you want to build, and it writes the code for you. But unlike other tools, you can see every change it makes and learn from it. It's like having a senior developer pair-programming with you — explaining things as they go.",
  })

  // Step 2: Install (skip if already installed)
  if (!env.claudeCode.installed) {
    steps.push({
      id: 'install-claude-code',
      phase: 'install-claude-code',
      title: 'Install Claude Code',
      explanation:
        "Let's install Claude Code globally on your machine. The **-g** flag means **global** — so you can use the `claude` command from any folder, not just this one. This might take a minute or two.",
      command: 'npm install -g @anthropic-ai/claude-code',
      expectedOutputPattern: 'added \\d+ packages',
      errorPatterns: ['EACCES', 'permission denied', 'ERR!'],
    })
  }

  // Step 3: Verify
  steps.push({
    id: 'verify-claude-code',
    phase: 'install-claude-code',
    title: env.claudeCode.installed ? 'Claude Code is Ready!' : 'Verify Installation',
    explanation: env.claudeCode.installed
      ? `Claude Code is already installed — version ${env.claudeCode.version ?? 'unknown'}. Let's double-check that it's working.`
      : "Let's make sure Claude Code installed correctly. You should see a version number — that means it's ready to go!",
    command: 'claude --version',
    expectedOutputPattern: '\\d+\\.\\d+',
    errorPatterns: ['not found', 'command not found'],
  })

  // Step 4: API key info
  steps.push({
    id: 'set-api-key',
    phase: 'install-claude-code',
    title: 'API Key Setup',
    explanation:
      "Claude Code needs your **Anthropic API key** to work. If you entered it during setup, it's already configured and you're all set!\n\nIf not, you can set it any time by running:\n`export ANTHROPIC_API_KEY=your-key-here`\n\nYou can get an API key from **console.anthropic.com**. It's what lets Claude Code talk to the AI behind the scenes.",
  })

  return {
    id: 'install-claude-code',
    title: 'Install Claude Code',
    description: "Install Anthropic's AI coding assistant",
    steps,
  }
}
