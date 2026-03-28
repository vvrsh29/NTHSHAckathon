import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Terminal, Star, AlertCircle, MessageSquare, ArrowRight, Rocket } from 'lucide-react'
import type { ClientMessage, Step, GeneratedFile, MentorMessageType } from '../../shared/types'
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
  explanation: {
    bubble: 'bg-surface-2',
    text: 'text-white',
    label: 'text-gray-400',
  },
  instruction: {
    bubble: 'bg-blue-900/50',
    text: 'text-blue-200',
    label: 'text-blue-400',
  },
  encouragement: {
    bubble: 'bg-green-900/50',
    text: 'text-green-200',
    label: 'text-green-400',
  },
  error_help: {
    bubble: 'bg-red-900/50',
    text: 'text-red-200',
    label: 'text-red-400',
  },
}

interface Props {
  send: (msg: ClientMessage) => void
  currentStep: Step | null
  commandSuggestion: { command: string; explanation: string } | null
  generatedFiles?: { files: GeneratedFile[]; explanation: string } | null
  messages: MentorMessage[]
  isThinking: boolean
  onStartThinking: () => void
}

export default function MentorPanel({
  send,
  currentStep,
  commandSuggestion,
  generatedFiles,
  messages,
  isThinking,
  onStartThinking,
}: Props) {
  const [question, setQuestion] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages update or thinking state changes
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

  const hasContent = messages.length > 0 || currentStep || commandSuggestion || generatedFiles

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Empty state */}
        {!hasContent && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 mb-4">
              <Rocket className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-gray-300 font-medium text-base mb-1">Your AI mentor is ready.</p>
            <p className="text-gray-500 text-sm">Start a project to begin.</p>
          </div>
        )}

        {/* Current step card */}
        {currentStep && (
          <div className="rounded-lg border border-brand-500/30 bg-brand-500/5 p-4 mb-4">
            <h3 className="text-brand-300 font-semibold text-sm mb-1">{currentStep.title}</h3>
            <p className="text-gray-300 text-sm">{currentStep.explanation}</p>
          </div>
        )}

        {/* Command suggestion */}
        {commandSuggestion && (
          <CommandPrompt command={commandSuggestion.command} explanation={commandSuggestion.explanation} />
        )}

        {/* Generated code files */}
        {generatedFiles && (
          <CodeExplainer files={generatedFiles.files} explanation={generatedFiles.explanation} />
        )}

        {/* Message bubbles */}
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

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse py-1">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:300ms]" />
            </span>
            Your mentor is thinking...
          </div>
        )}
      </div>

      {/* Bottom bar: Next Step + Question input */}
      <div className="flex-none border-t border-white/10 p-3 space-y-2">
        {/* Next Step button — only show when there's an active step */}
        {currentStep && (
          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition w-full justify-center"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Question input */}
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
