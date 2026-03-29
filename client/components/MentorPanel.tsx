import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Wrench, X, Bot, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ClientMessage, Step, MentorMessageType, Phase, ServerMessage } from '../../shared/types'
import type { MentorMessage } from '../hooks/useMentor'
import CommandPrompt from './CommandPrompt'

const labelText: Record<MentorMessageType, string> = {
  explanation: 'Mentor',
  instruction: 'Instruction',
  encouragement: 'Nice work',
  error_help: 'Error',
}

interface Props {
  send: (msg: ClientMessage) => void
  addListener: (fn: (msg: ServerMessage) => void) => () => void
  currentStep: Step | null
  commandSuggestion: { command: string; explanation: string } | null
  messages: MentorMessage[]
  isThinking: boolean
  onStartThinking: () => void
}

export default function MentorPanel({
  send,
  addListener,
  currentStep,
  commandSuggestion,
  messages,
  isThinking,
  onStartThinking,
}: Props) {
  const [question, setQuestion] = useState('')
  const [panicVisible, setPanicVisible] = useState(false)
  const [panicMessage, setPanicMessage] = useState('')
  const [showAutoFix, setShowAutoFix] = useState(false)
  const [waitingForNext, setWaitingForNext] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastErrorIdRef = useRef<string | null>(null)

  useEffect(() => {
    const unsub = addListener((msg) => {
      if (msg.type === 'phase_complete') fireConfetti(msg.phase)
    })
    return unsub
  }, [addListener])

  useEffect(() => {
    const lastError = messages.filter((m) => m.messageType === 'error_help').at(-1)
    if (lastError && lastError.id !== lastErrorIdRef.current) {
      lastErrorIdRef.current = lastError.id
      setPanicMessage(lastError.content)
      setPanicVisible(true)
      setShowAutoFix(true)
    }
  }, [messages])

  useEffect(() => {
    setWaitingForNext(!!currentStep && !isThinking)
  }, [currentStep, isThinking])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100
    if (isNearBottom) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [messages, isThinking])

  const handleAsk = () => {
    if (!question.trim()) return
    send({ type: 'mentor_question', question: question.trim() })
    onStartThinking()
    setQuestion('')
  }

  const handleNextStep = () => {
    setWaitingForNext(false)
    send({ type: 'next_step' } as any)
    onStartThinking()
  }

  const handleAutoFix = () => {
    send({ type: 'auto_fix' })
    setPanicVisible(false)
    setShowAutoFix(false)
    onStartThinking()
  }

  const hasContent = messages.length > 0 || currentStep || commandSuggestion

  return (
    <div className="flex flex-col h-full relative">

      {/* Panic overlay */}
      <AnimatePresence>
        {panicVisible && (
          <motion.div
            key="panic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96 }}
              className="bg-card border rounded-lg p-5 max-w-xs w-full shadow-lg"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Something went wrong</p>
                  <div className="text-xs text-muted-foreground prose prose-sm prose-zinc dark:prose-invert max-w-none">
                    <ReactMarkdown>{panicMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleAutoFix} className="flex-1 gap-1.5 h-8 text-xs">
                  <Wrench className="w-3 h-3" />
                  Auto-Fix
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPanicVisible(false)} className="h-8 w-8 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable messages feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
        {!hasContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Mentor ready</p>
              <p className="text-xs text-muted-foreground">Launch a project to get started.</p>
            </div>
          </div>
        )}

        {/* Message feed */}
        {messages.map((msg, i) => (
          <div key={msg.id} className="space-y-1.5">
            {i > 0 && <Separator className="my-1" />}
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[10px] font-medium uppercase tracking-wider',
                msg.messageType === 'error_help' ? 'text-destructive' :
                msg.messageType === 'encouragement' ? 'text-emerald-600 dark:text-emerald-400' :
                msg.messageType === 'instruction' ? 'text-blue-600 dark:text-blue-400' :
                'text-muted-foreground'
              )}>
                {labelText[msg.messageType]}
              </span>
              {msg.streaming && (
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:100ms]" />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:200ms]" />
                </span>
              )}
            </div>
            <div className="text-sm text-foreground prose prose-sm prose-zinc dark:prose-invert max-w-none leading-relaxed">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 py-1">
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:100ms]" />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:200ms]" />
            </span>
            <span className="text-xs text-muted-foreground">Thinking…</span>
          </div>
        )}
      </div>

      {/* Pinned bottom section: step card + command prompt + controls */}
      <div className="flex-none border-t bg-background">
        {/* Compact current step card */}
        {currentStep && (
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current step</span>
            </div>
            <p className="text-xs font-medium pl-5">{currentStep.title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 mt-0.5">{currentStep.explanation}</p>
          </div>
        )}

        {/* Command prompt */}
        {commandSuggestion && (
          <div className="px-3 pb-2">
            <CommandPrompt
              command={commandSuggestion.command}
              send={send}
            />
          </div>
        )}

        {/* Next step + ask input */}
        <div className="p-3 pt-2 space-y-2">
          {currentStep && (
            <Button variant="default" onClick={handleNextStep} className={cn("w-full gap-2", waitingForNext && "animate-pulse")}>
              Next step
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything…"
              className="flex-1 h-8 px-3 text-xs bg-muted border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button size="sm" onClick={handleAsk} disabled={isThinking || !question.trim()} className="h-8 text-xs px-3">
              Ask
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function fireConfetti(phase: Phase) {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  setTimeout(() => confetti({ particleCount: 50, spread: 55, origin: { x: 0.2, y: 0.5 } }), 200)
  setTimeout(() => confetti({ particleCount: 50, spread: 55, origin: { x: 0.8, y: 0.5 } }), 400)
}
