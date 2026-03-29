// ============================================================
// LaunchPad — Shared WebSocket Message Types
// ============================================================

// --- Course System ---

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type CourseTopic = string

// Phase is a string — phases differ per course level
export type Phase = string

export interface Step {
  id: string
  phase: Phase
  title: string
  explanation: string
  command?: string
  expectedOutputPattern?: string
  errorPatterns?: string[]
}

export interface PhaseDefinition {
  id: Phase
  title?: string
  description?: string
  steps: Step[]
}

export interface EnvDetectionResult {
  platform: 'macos' | 'linux' | 'windows'
  git: { installed: boolean; version?: string }
  node: { installed: boolean; version?: string }
  python: { installed: boolean; version?: string }
  claudeCode: { installed: boolean; version?: string }
  xcodeClT: { installed: boolean }
  vscode: { installed: boolean }
}

// --- Client → Server ---

export type ClientMessage =
  | { type: 'select_course'; level: CourseLevel; apiKey?: string; buildIdea?: string; userName?: string; userRole?: string; projectDir?: string; courseTopic?: string }
  | { type: 'set_api_key'; apiKey: string }
  | { type: 'pty_input'; data: string }
  | { type: 'pty_resize'; cols: number; rows: number }
  | { type: 'terminal_input'; data: string }
  | { type: 'terminal_resize'; cols: number; rows: number }
  | { type: 'next_step' }
  | { type: 'mentor_question'; question: string }
  | { type: 'mode_change'; mode: 'auto' | 'tutor' }
  | { type: 'ghost_type'; command: string }
  | { type: 'auto_fix' }

// --- Server → Client ---

export type ServerMessage =
  | { type: 'terminal_output'; data: string }
  | { type: 'pty_output'; data: string }
  | { type: 'pty_ready' }
  | { type: 'mentor_message'; messageType: MentorMessageType; content: string; streaming?: boolean }
  | { type: 'step_update'; phase: Phase; stepIndex: number; step: Step }
  | { type: 'command_suggestion'; command: string; explanation: string }
  | { type: 'ssh_status'; connected: boolean }
  | { type: 'phase_complete'; phase: Phase }
  | { type: 'env_detection'; results: EnvDetectionResult }
  | { type: 'course_started'; level: CourseLevel; phases: PhaseDefinition[] }

// --- Enums / Subtypes ---

export type MentorMessageType = 'explanation' | 'instruction' | 'encouragement' | 'error_help'
