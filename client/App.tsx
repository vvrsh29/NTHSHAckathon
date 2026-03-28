import { useState, useCallback } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import TerminalPanel from './components/TerminalPanel'
import MentorPanel from './components/MentorPanel'
import WelcomeScreen from './components/WelcomeScreen'
import StepIndicator from './components/StepIndicator'
import type { ServerMessage, Phase, Step } from '../shared/types'

export default function App() {
  const [started, setStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup')
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [commandSuggestion, setCommandSuggestion] = useState<{ command: string; explanation: string } | null>(null)

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'step_update':
        setCurrentPhase(msg.phase)
        setStepIndex(msg.stepIndex)
        setCurrentStep(msg.step)
        break
      case 'command_suggestion':
        setCommandSuggestion({ command: msg.command, explanation: msg.explanation })
        break
    }
  }, [])

  const { send, connected } = useWebSocket(handleMessage)

  const handleStart = useCallback((description: string, apiKey?: string) => {
    send({ type: 'start_project', description, apiKey })
    setStarted(true)
  }, [send])

  if (!started) {
    return <WelcomeScreen onStart={handleStart} connected={connected} />
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      {/* Top bar */}
      <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-white/10 bg-surface-1">
        <div className="flex items-center gap-3">
          <span className="text-brand-400 font-bold text-lg">LaunchPad</span>
          <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <StepIndicator currentPhase={currentPhase} stepIndex={stepIndex} />
      </div>

      {/* Main panels */}
      <div className="flex-1 flex min-h-0">
        {/* Terminal — left */}
        <div className="w-1/2 border-r border-white/10 flex flex-col">
          <div className="flex-none px-4 py-2 text-xs text-gray-400 uppercase tracking-wide bg-surface-1 border-b border-white/5">
            Terminal
          </div>
          <div className="flex-1 min-h-0">
            <TerminalPanel send={send} />
          </div>
        </div>

        {/* Mentor — right */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-none px-4 py-2 text-xs text-gray-400 uppercase tracking-wide bg-surface-1 border-b border-white/5">
            AI Mentor
          </div>
          <div className="flex-1 min-h-0">
            <MentorPanel
              send={send}
              currentStep={currentStep}
              commandSuggestion={commandSuggestion}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
