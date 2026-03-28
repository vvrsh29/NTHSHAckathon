import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { MessageCircle, Sparkles, AlertTriangle, BookOpen } from 'lucide-react'
import type { ClientMessage, Step, GeneratedFile, MentorMessageType, ServerMessage } from '../../shared/types'
import CommandPrompt from './CommandPrompt'
import CodeExplainer from './CodeExplainer'

interface MentorMsg {
  id: string
  messageType: MentorMessageType
  content: string
  timestamp: number
}

interface Props {
  send: (msg: ClientMessage) => void
  currentStep: Step | null
  commandSuggestion: { command: string; explanation: string } | null
  generatedFiles?: { files: GeneratedFile[]; explanation: string } | null
}

const iconMap: Record<MentorMessageType, any> = {
  explanation: BookOpen,
  instruction: MessageCircle,
  encouragement: Sparkles,
  error_help: AlertTriangle,
}

const colorMap: Record<MentorMessageType, string> = {
  explanation: 'border-blue-500/30 bg-blue-500/5',
  instruction: 'border-brand-500/30 bg-brand-500/5',
  encouragement: 'border-emerald-500/30 bg-emerald-500/5',
  error_help: 'border-amber-500/30 bg-amber-500/5',
}

export default function MentorPanel({ send, currentStep, commandSuggestion, generatedFiles }: Props) {
  const [messages, setMessages] = useState<MentorMsg[]>([])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Listen for mentor_message via window event
  useEffect(() => {
    function handler(e: CustomEvent<ServerMessage>) {
      if (e.detail.type === 'mentor_message') {
        const msg = e.detail
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            messageType: msg.messageType,
            content: msg.content,
            timestamp: Date.now(),
          },
        ])
        setAsking(false)
      }
    }
    window.addEventListener('ws-message', handler as any)
    return () => window.removeEventListener('ws-message', handler as any)
  }, [])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleAsk = () => {
    if (!question.trim()) return
    send({ type: 'mentor_question', question: question.trim() })
    setAsking(true)
    setQuestion('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
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
          return (
            <div key={msg.id} className={`rounded-lg border p-3 ${colorMap[msg.messageType]}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 capitalize">{msg.messageType.replace('_', ' ')}</span>
              </div>
              <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )
        })}

        {asking && (
          <div className="text-gray-500 text-sm animate-pulse">Your mentor is thinking...</div>
        )}
      </div>

      {/* Question input */}
      <div className="flex-none border-t border-white/10 p-3">
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
            disabled={asking || !question.trim()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 disabled:opacity-40 transition"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}
