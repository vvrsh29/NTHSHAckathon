import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import { useMentor } from './hooks/useMentor'
import TerminalPanel from './components/TerminalPanel'
import MentorPanel from './components/MentorPanel'
import WelcomeScreen from './components/WelcomeScreen'
import StepIndicator from './components/StepIndicator'
import ModeSwitch from './components/ModeSwitch'
import type { ServerMessage, Phase, Step, GeneratedFile } from '../shared/types'

export default function App() {
  const [started, setStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup')
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [commandSuggestion, setCommandSuggestion] = useState<{ command: string; explanation: string } | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<{ files: GeneratedFile[]; explanation: string } | null>(null)

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
      case 'code_generated':
        setGeneratedFiles({ files: msg.files, explanation: msg.explanation })
        break
    }
  }, [])

  const { send, connected, addListener } = useWebSocket(handleMessage)
  const { messages: mentorMessages, isThinking, startThinking } = useMentor(addListener)

  const handleStart = useCallback((description: string, apiKey?: string) => {
    send({ type: 'start_project', description, apiKey })
    setStarted(true)
  }, [send])

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen onStart={handleStart} connected={connected} />
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen flex flex-col bg-surface-0"
        >
          {/* Top bar */}
          <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-white/10 bg-surface-1">
            <div className="flex items-center gap-3">
              <span className="text-brand-400 font-bold text-lg">LaunchPad</span>
              {connected ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Connected" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs text-yellow-400">Reconnecting...</span>
                </span>
              )}
              <ModeSwitch send={send} />
            </div>
            <StepIndicator currentPhase={currentPhase} stepIndex={stepIndex} />
          </div>

          {/* Main panels */}
          <div className="flex-1 flex min-h-0">
            {/* Terminal — left */}
            <div className="w-1/2 min-w-0 border-r border-white/10 flex flex-col overflow-hidden">
              <div className="flex-none px-4 py-2 text-xs text-gray-400 uppercase tracking-wide bg-surface-1 border-b border-white/5">
                Terminal
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <TerminalPanel send={send} />
              </div>
            </div>

            {/* Mentor — right */}
            <div className="w-1/2 min-w-0 flex flex-col">
              <div className="flex-none px-4 py-2 text-xs text-gray-400 uppercase tracking-wide bg-surface-1 border-b border-white/5">
                AI Mentor
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <MentorPanel
                  send={send}
                  currentStep={currentStep}
                  commandSuggestion={commandSuggestion}
                  generatedFiles={generatedFiles}
                  messages={mentorMessages}
                  isThinking={isThinking}
                  onStartThinking={startThinking}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
