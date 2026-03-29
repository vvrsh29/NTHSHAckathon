import type { CourseLevel, EnvDetectionResult, PhaseDefinition } from '../../shared/types.js'

// Import course phase definitions
import { getTerminalBasicsPhase } from './beginner/terminal-basics.js'
import { getEnvSetupPhase } from './beginner/environment-setup.js'
import { getVscodePhase } from './beginner/vscode-basics.js'
import { getInstallClaudeCodePhase } from './beginner/install-claude-code.js'
import { getFirstProjectPhase } from './beginner/first-project.js'
import { getCelebrationPhase } from './beginner/celebration.js'
import { getEnvCheckPhase } from './intermediate/env-check.js'
import { getIntermediateClaudeCodePhase } from './intermediate/install-claude-code.js'
import { getIntermediateProjectPhase } from './intermediate/first-project.js'
import { getTipsPhase } from './intermediate/tips.js'
import { getAdvancedCoursePhases } from './advanced/claude-code-mastery.js'

export function loadCourse(level: CourseLevel, env: EnvDetectionResult): PhaseDefinition[] {
  switch (level) {
    case 'beginner':
      return [
        getTerminalBasicsPhase(),
        getEnvSetupPhase(env),
        getVscodePhase(env),
        getInstallClaudeCodePhase(env),
        getFirstProjectPhase(),
        getCelebrationPhase(),
      ]
    case 'intermediate':
      return [
        getEnvCheckPhase(env),
        getIntermediateClaudeCodePhase(env),
        getIntermediateProjectPhase(),
        getTipsPhase(),
      ]
    case 'advanced':
      return getAdvancedCoursePhases()
  }
}
