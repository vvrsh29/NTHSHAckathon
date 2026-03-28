import type { WebSocket } from 'ws'
import type { ServerMessage, Step, Phase } from '../shared/types.js'
import type { StepEngineState, PhaseDefinition } from './steps/types.js'

export interface OutputProvider {
  getCleanOutput(maxLines: number): string
}
import { getSetupPhase } from './steps/setup.js'
import { getScaffoldPhase } from './steps/scaffold.js'
import { getBuildPhase } from './steps/build.js'
import { getStylePhase } from './steps/style.js'
import { getDeployPhase } from './steps/deploy.js'

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

export class StepEngine {
  private state: StepEngineState
  private ws: WebSocket
  private pty: OutputProvider
  private outputCheckTimer: ReturnType<typeof setTimeout> | null = null
  private onError?: (error: string, terminalOutput: string) => void
  private onPhaseComplete?: (phase: Phase) => void
  private failureCounts: Map<string, number> = new Map()

  constructor(
    ws: WebSocket,
    pty: OutputProvider,
    onError?: (error: string, terminalOutput: string) => void,
    onPhaseComplete?: (phase: Phase) => void
  ) {
    this.ws = ws
    this.pty = pty
    this.onError = onError
    this.onPhaseComplete = onPhaseComplete
    this.state = {
      currentPhase: 'setup',
      currentStepIndex: 0,
      phases: [],
      projectName: '',
      projectDescription: '',
      mode: 'tutor',
      started: false,
    }
  }

  startProjectWithPhases(name: string, description: string, phases: Array<{ id: Phase; steps: Step[] }>) {
    this.state.projectName = name
    this.state.projectDescription = description
    this.state.started = true
    this.state.phases = phases
    this.state.currentPhase = phases[0]?.id || 'setup'
    this.state.currentStepIndex = 0
    this.emitCurrentStep()
    this.emitCommandSuggestion()
    this.startOutputWatch()
  }

  startProject(description: string) {
    // Derive a safe project name from description
    const projectName = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 30) || 'my-project'

    this.state.projectName = projectName
    this.state.projectDescription = description
    this.state.started = true

    // Build phases
    this.state.phases = [
      getSetupPhase(projectName),
      getScaffoldPhase(projectName),
      getBuildPhase(),
      getStylePhase(),
      getDeployPhase(),
    ]

    this.state.currentPhase = 'setup'
    this.state.currentStepIndex = 0

    // Send initial step
    this.emitCurrentStep()
    this.emitCommandSuggestion()
    this.startOutputWatch()
  }

  nextStep() {
    const phase = this.getCurrentPhase()
    if (!phase) return

    if (this.state.currentStepIndex < phase.steps.length - 1) {
      this.state.currentStepIndex++
    } else {
      // Phase complete — emit event for confetti
      const completedPhase = this.state.currentPhase
      send(this.ws, { type: 'phase_complete', phase: completedPhase })
      this.onPhaseComplete?.(completedPhase)

      // Move to next phase
      const phaseIndex = this.state.phases.findIndex((p) => p.id === this.state.currentPhase)
      if (phaseIndex < this.state.phases.length - 1) {
        this.state.currentPhase = this.state.phases[phaseIndex + 1].id
        this.state.currentStepIndex = 0
      } else {
        // All done!
        send(this.ws, { type: 'phase_complete', phase: completedPhase })
        send(this.ws, {
          type: 'mentor_message',
          messageType: 'encouragement',
          content: '🎉 **Congratulations!** You completed all phases! You just built a website from the terminal. You\'re officially a coder!',
        })
        return
      }
    }

    this.emitCurrentStep()
    this.emitCommandSuggestion()
  }

  getFailureCount(stepId: string): number {
    return this.failureCounts.get(stepId) || 0
  }

  incrementFailure(stepId: string) {
    this.failureCounts.set(stepId, (this.failureCounts.get(stepId) || 0) + 1)
  }

  runCurrentCommand(runFn: (command: string) => void) {
    const step = this.getCurrentStep()
    if (step?.command) {
      runFn(step.command)
    }
  }

  setMode(mode: 'auto' | 'tutor') {
    this.state.mode = mode
  }

  private getCurrentPhase(): PhaseDefinition | undefined {
    return this.state.phases.find((p) => p.id === this.state.currentPhase)
  }

  private getCurrentStep() {
    const phase = this.getCurrentPhase()
    if (!phase) return null
    return phase.steps[this.state.currentStepIndex] || null
  }

  private emitCurrentStep() {
    const step = this.getCurrentStep()
    if (!step) return

    send(this.ws, {
      type: 'step_update',
      phase: this.state.currentPhase,
      stepIndex: this.state.currentStepIndex,
      step,
    })

    // Also send an explanation
    send(this.ws, {
      type: 'mentor_message',
      messageType: 'explanation',
      content: step.explanation,
    })
  }

  private emitCommandSuggestion() {
    const step = this.getCurrentStep()
    if (!step?.command) return

    send(this.ws, {
      type: 'command_suggestion',
      command: step.command,
      explanation: step.explanation,
    })
  }

  private startOutputWatch() {
    let lastMatchedStepId: string | null = null

    const check = () => {
      const step = this.getCurrentStep()
      if (!step?.expectedOutputPattern) return

      // Avoid firing the same step's success message more than once
      if (lastMatchedStepId === step.id) return

      const output = this.pty.getCleanOutput(20)

      // Check for error patterns first — surface them before success
      if (step.errorPatterns) {
        for (const errPattern of step.errorPatterns) {
          if (new RegExp(errPattern).test(output)) {
            if (this.onError) {
              this.onError(errPattern, output)
            } else {
              send(this.ws, {
                type: 'mentor_message',
                messageType: 'error_help',
                content: `It looks like something went wrong. I noticed: \`${errPattern}\`. Don't worry — errors happen to everyone! Let me help you fix it.`,
              })
            }
            return
          }
        }
      }

      const pattern = new RegExp(step.expectedOutputPattern)
      if (!pattern.test(output)) return

      // Mark this step as matched so we don't fire again
      lastMatchedStepId = step.id

      if (this.state.mode === 'tutor') {
        send(this.ws, {
          type: 'mentor_message',
          messageType: 'instruction',
          content: '✓ That worked! Click **Next Step** when you\'re ready to continue.',
        })
      } else {
        // Auto mode — advance automatically after a short delay
        setTimeout(() => {
          this.nextStep()
        }, 1000)
      }
    }

    this.outputCheckTimer = setInterval(check, 1000)
  }

  getState() {
    return {
      phase: this.state.currentPhase,
      step: this.getCurrentStep(),
    }
  }

  destroy() {
    if (this.outputCheckTimer) {
      clearInterval(this.outputCheckTimer)
    }
  }
}
