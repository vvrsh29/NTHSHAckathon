import type { WebSocket } from 'ws'
import type { ServerMessage } from '../shared/types.js'
import type { StepEngineState, PhaseDefinition } from './steps/types.js'
import { getSetupPhase } from './steps/setup.js'
import { getScaffoldPhase } from './steps/scaffold.js'
import { getBuildPhase } from './steps/build.js'
import { getStylePhase } from './steps/style.js'
import { getDeployPhase } from './steps/deploy.js'
import { PtyManager } from './pty-manager.js'

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

export class StepEngine {
  private state: StepEngineState
  private ws: WebSocket
  private pty: PtyManager
  private outputCheckTimer: ReturnType<typeof setTimeout> | null = null
  private onError?: (error: string, terminalOutput: string) => void

  constructor(
    ws: WebSocket,
    pty: PtyManager,
    onError?: (error: string, terminalOutput: string) => void
  ) {
    this.ws = ws
    this.pty = pty
    this.onError = onError
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
          content: '🎉 **Congratulations!** You completed all phases! You just built a website from the terminal. You\'re officially a coder!',
        })
        return
      }
    }

    this.emitCurrentStep()
    this.emitCommandSuggestion()
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
    // Debounced check of terminal output for step completion
    const check = () => {
      const step = this.getCurrentStep()
      if (!step?.expectedOutputPattern) return

      const output = this.pty.getCleanOutput(20)
      const pattern = new RegExp(step.expectedOutputPattern)

      if (pattern.test(output)) {
        // Check for errors first
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
        // Pattern matched, auto-advance if in auto mode
        // In tutor mode, just mark as ready
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
