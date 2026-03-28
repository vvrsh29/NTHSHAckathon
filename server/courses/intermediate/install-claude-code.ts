import type { PhaseDefinition, EnvDetectionResult, Step } from '../../../shared/types.js'

export function getIntermediateClaudeCodePhase(env: EnvDetectionResult): PhaseDefinition {
  const steps: Step[] = []

  // Step 1: Install (skip if already installed)
  if (!env.claudeCode.installed) {
    steps.push({
      id: 'install-cc',
      phase: 'intermediate-claude-code',
      title: 'Install Claude Code',
      explanation:
        "Let's install **Claude Code** globally via npm. This gives you the `claude` command everywhere in your terminal.",
      command: 'npm install -g @anthropic-ai/claude-code',
      expectedOutputPattern: 'added',
      errorPatterns: ['EACCES', 'permission denied', 'ERR!'],
    })
  }

  // Step 2: Verify
  steps.push({
    id: 'verify-cc',
    phase: 'intermediate-claude-code',
    title: env.claudeCode.installed ? 'Claude Code is Ready' : 'Verify Installation',
    explanation: env.claudeCode.installed
      ? `Claude Code ${env.claudeCode.version ?? ''} is installed. Let's confirm it's working.`
      : "Let's confirm Claude Code is installed and working.",
    command: 'claude --version',
    expectedOutputPattern: '\\d+',
    errorPatterns: ['not found', 'command not found'],
  })

  return {
    id: 'intermediate-claude-code',
    title: 'Claude Code Setup',
    description: 'Install or verify Claude Code',
    steps,
  }
}
