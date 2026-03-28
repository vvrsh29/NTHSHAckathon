import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'framer-motion'
import { Terminal, Star, AlertCircle, MessageSquare, ArrowRight, Rocket, Wrench, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { ClientMessage, Step, GeneratedFile, MentorMessageType, Phase, ServerMessage } from '../../shared/types'
import type { MentorMessage } from '../hooks/useMentor'
import CommandPrompt from './CommandPrompt'
import CodeExplainer from './CodeExplainer'

const iconMap: Record<MentorMessageType, React.ElementType> = {
  explanation: MessageSquare,
  instruction: Terminal,
  encouragement: Star,
  error_help: AlertCircle,
}

const styleMap: Record<MentorMessageType, { bubble: string; text: string; label: string }> = {
  explanation: { bubble: 'bg-surface-2', text: 'text-white', label: 'text-gray-400' },
  instruction: { bubble: 'bg-blue-900/50', text: 'text-blue-200', label: 'text-blue-400' },
  encouragement: { bubble: 'bg-green-900/50', text: 'text-green-200', label: 'text-green-400' },
  error_help: { bubble: 'bg-red-900/50', text: 'text-red-200', label: 'text-red-400' },
}

interface Props {
  send: (msg: ClientMessage) => void
  addListener: (fn: (msg: ServerMessage) => void) => () => void
  currentStep: Step | null
  commandSuggestion: { command: string; explanation: string } | null
  generatedFiles?: { files: GeneratedFile[]; explanation: string } | null
  messages: MentorMessage[]
  isThinking: boolean
  onStartThinking: () => void
}

export default function MentorPanel({
  send,
  addListener,
  currentStep,
  commandSuggestion,
  generatedFiles,
  messages,
  isThinking,
  onStartThinking,
}: Props) {
  const [question, setQuestion] = useState('')
  const [panicVisible, setPanicVisible] = useState(false)
  const [panicMessage, setPanicMessage] = useState('')
  const [showAutoFix, setShowAutoFix] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Listen for phase_complete → confetti
  useEffect(() => {
    const unsub = addListener((msg) => {
      if (msg.type === 'phase_complete') {
        fireConfetti(msg.phase)
      }
    })
    return unsub
  }, [addListener])

  const lastErrorIdRef = useRef<string | null>(null)

  // Listen for error_help → panic interceptor (only on new error messages)
  useEffect(() => {
    const lastError = messages.filter((m) => m.messageType === 'error_help').at(-1)
    if (lastError && lastError.id !== lastErrorIdRef.current) {
      lastErrorIdRef.current = lastError.id
      setPanicMessage(lastError.content)
      setPanicVisible(true)
      setShowAutoFix(true)
    }
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  const handleAsk = () => {
    if (!question.trim()) return
    send({ type: 'mentor_question', question: question.trim() })
    onStartThinking()
    setQuestion('')
  }

  const handleNextStep = () => {
    send({ type: 'next_step' } as any)
    onStartThinking()
  }

  const handleAutoFix = () => {
    send({ type: 'auto_fix' })
    setPanicVisible(false)
    setShowAutoFix(false)
    onStartThinking()
  }

  const hasContent = messages.length > 0 || currentStep || commandSuggestion || generatedFiles

  return (
    <div className="flex flex-col h-full relative">
      {/* Panic interceptor overlay */}
      <AnimatePresence>
        {panicVisible && (
          <motion.div
            key="panic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 8 }}
              className="bg-red-950/90 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-base mb-2">Something went wrong</h3>
              <div className="text-red-200 text-sm prose prose-invert prose-sm max-w-none mb-4">
                <ReactMarkdown>{panicMessage}</ReactMarkdown>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleAutoFix}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition"
                >
                  <Wrench className="w-4 h-4" />
                  Auto-Fix
                </button>
                <button
                  onClick={() => setPanicVisible(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 mb-4">
              <Rocket className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-gray-300 font-medium text-base mb-1">Your AI mentor is ready.</p>
            <p className="text-gray-500 text-sm">Start a project to begin.</p>
          </div>
        )}

        {currentStep && (
          <div className="rounded-lg border border-brand-500/30 bg-brand-500/5 p-4 mb-4">
            <h3 className="text-brand-300 font-semibold text-sm mb-1">{currentStep.title}</h3>
            <p className="text-gray-300 text-sm">{currentStep.explanation}</p>
          </div>
        )}

        {commandSuggestion && (
          <CommandPrompt
            command={commandSuggestion.command}
            explanation={commandSuggestion.explanation}
            send={send}
          />
        )}

        {generatedFiles && (
          <CodeExplainer files={generatedFiles.files} explanation={generatedFiles.explanation} />
        )}

        {messages.map((msg) => {
          const Icon = iconMap[msg.messageType]
          const styles = styleMap[msg.messageType]
          return (
            <div key={msg.id} className={`rounded-lg p-3 ${styles.bubble}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${styles.label}`} />
                <span className={`text-xs capitalize ${styles.label}`}>
                  {msg.messageType.replace('_', ' ')}
                </span>
                {msg.streaming && (
                  <span className="text-xs text-gray-500 animate-pulse ml-auto">typing…</span>
                )}
              </div>
              <div className={`text-sm prose prose-invert prose-sm max-w-none ${styles.text}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )
        })}

        {isThinking && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
            </span>
            Your mentor is thinking...
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex-none border-t border-white/10 p-3 space-y-2">
        <div className="flex gap-2">
          {currentStep && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition flex-1 justify-center"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {showAutoFix && (
            <button
              onClick={handleAutoFix}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition"
              title="Automatically run the fix command"
            >
              <Wrench className="w-4 h-4" />
              Auto-Fix
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask me anything..."
            className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500/50"
          />
          <button
            onClick={handleAsk}
            disabled={isThinking || !question.trim()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 disabled:opacity-40 transition"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

function fireConfetti(phase: Phase) {
  const colors: Record<Phase, string[]> = {
    setup: ['#a78bfa', '#7c3aed'],
    scaffold: ['#34d399', '#059669'],
    build: ['#60a5fa', '#2563eb'],
    style: ['#f472b6', '#db2777'],
    deploy: ['#fbbf24', '#d97706', '#a78bfa'],
  }
  const cols = colors[phase] || ['#a78bfa', '#60a5fa']

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: cols,
  })
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 60, origin: { x: 0.2, y: 0.5 }, colors: cols })
  }, 200)
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 60, origin: { x: 0.8, y: 0.5 }, colors: cols })
  }, 400)
}
