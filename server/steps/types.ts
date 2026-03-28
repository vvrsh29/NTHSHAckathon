import type { Phase, Step } from '../../shared/types.js'

export type { Phase, Step }

export interface PhaseDefinition {
  id: Phase
  title: string
  description: string
  steps: Step[]
}

export interface StepEngineState {
  currentPhase: Phase
  currentStepIndex: number
  phases: PhaseDefinition[]
  projectName: string
  projectDescription: string
  mode: 'auto' | 'tutor'
  started: boolean
}
