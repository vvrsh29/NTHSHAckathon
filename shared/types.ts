// ============================================================
// LaunchPad — Shared WebSocket Message Types
// ============================================================

// --- Client → Server ---

export type ClientMessage =
  | { type: 'terminal_input'; data: string }
  | { type: 'terminal_resize'; cols: number; rows: number }
  | { type: 'start_project'; description: string; apiKey?: string }
  | { type: 'next_step' }
  | { type: 'mentor_question'; question: string }
  | { type: 'mode_change'; mode: 'auto' | 'tutor' }

// --- Server → Client ---

export type ServerMessage =
  | { type: 'terminal_output'; data: string }
  | { type: 'mentor_message'; messageType: MentorMessageType; content: string; streaming?: boolean }
  | { type: 'step_update'; phase: Phase; stepIndex: number; step: Step }
  | { type: 'command_suggestion'; command: string; explanation: string }
  | { type: 'code_generated'; files: GeneratedFile[]; explanation: string }
  | { type: 'plan_parsed'; plan: ParsedPlan }
  | { type: 'toml_generated'; path: string }
  | { type: 'env_generated'; vars: string[] }
  | { type: 'files_generated'; files: string[] }
  | { type: 'steps_expanded'; steps: Step[] }

// --- Enums / Subtypes ---

export type MentorMessageType = 'explanation' | 'instruction' | 'encouragement' | 'error_help'

export type Phase = 'setup' | 'scaffold' | 'build' | 'style' | 'deploy'

export interface Step {
  id: string
  phase: Phase
  title: string
  explanation: string
  command?: string
  expectedOutputPattern?: string
  errorPatterns?: string[]
}

export interface GeneratedFile {
  path: string
  content: string
  explanation: string
}

export interface ParsedPlan {
  name: string
  description: string
  type: string
  features: string[]
  techStack: string[]
  estimatedSteps: number
}
