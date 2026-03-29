import type { WebSocket } from 'ws'
import type { ServerMessage, Step, Phase, PhaseDefinition, CourseLevel } from '../shared/types.js'

export interface OutputProvider {
  getCleanOutput(maxLines: number): string
}

export interface StepEngineState {
  currentPhase: Phase
  currentStepIndex: number
  phases: PhaseDefinition[]
  level: CourseLevel | null
  mode: 'auto' | 'tutor'
  started: boolean
}

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
    onPhaseComplete?: (phase: Phase) => void,
  ) {
    this.ws = ws
    this.pty = pty
    this.onError = onError
    this.onPhaseComplete = onPhaseComplete
    this.state = {
      currentPhase: '',
      currentStepIndex: 0,
      phases: [],
      level: null,
      mode: 'auto',
      started: false,
    }
  }

  /** Replace the output provider (e.g. when switching between SSH and direct PTY) */
  setOutputProvider(pty: OutputProvider) {
    this.pty = pty
  }

  startCourse(level: CourseLevel, phases: PhaseDefinition[]) {
    this.state.level = level
    this.state.started = true
    this.state.phases = phases
    this.state.currentPhase = phases[0]?.id || ''
    this.state.currentStepIndex = 0
    this.failureCounts.clear()
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
      // Phase complete — emit event
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
        send(this.ws, {
          type: 'mentor_message',
          messageType: 'encouragement',
          content:
            '**Congratulations!** You completed all phases! You just learned to use Claude Code from the terminal. You are officially ready to build anything!',
        })
        send(this.ws, { type: 'course_complete' })
        return
      }
    }

    this.emitCurrentStep()
    setTimeout(() => this.emitCommandSuggestion(), 300)
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

  private getCurrentStep(): Step | null {
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
    // Clear any existing timer
    if (this.outputCheckTimer) {
      clearInterval(this.outputCheckTimer)
    }

    let lastMatchedStepId: string | null = null
    let lastErrorStepId: string | null = null

    const check = () => {
      const step = this.getCurrentStep()
      if (!step?.expectedOutputPattern) return

      // Avoid firing the same step's success message more than once
      if (lastMatchedStepId === step.id) return

      const output = this.pty.getCleanOutput(20)

      // Check for error patterns first — surface them before success (once per step)
      if (step.errorPatterns && lastErrorStepId !== step.id) {
        for (const errPattern of step.errorPatterns) {
          if (new RegExp(errPattern).test(output)) {
            lastErrorStepId = step.id
            if (this.onError) {
              this.onError(errPattern, output)
            } else {
              send(this.ws, {
                type: 'mentor_message',
                messageType: 'error_help',
                content: `It looks like something went wrong. I noticed: \`${errPattern}\`. Don\'t worry — errors happen to everyone! Let me help you fix it.`,
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
          content: 'That worked! Click **Next Step** when you are ready to continue.',
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
