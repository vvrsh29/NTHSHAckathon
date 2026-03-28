import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Code2, Layout, BookOpen, Sparkles, Terminal, RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  onStart: (description: string) => void
  onResume?: (projectName: string) => void
  connected: boolean
}

const templates = [
  { icon: Layout, label: 'Portfolio Site', description: 'A personal portfolio to showcase your work' },
  { icon: BookOpen, label: 'Blog', description: 'A simple blog with posts and a reading layout' },
  { icon: Code2, label: 'Landing Page', description: 'A product or project landing page' },
  { icon: Sparkles, label: 'To-Do App', description: 'An interactive to-do list with add and delete' },
]

export default function WelcomeScreen({ onStart, onResume, connected }: Props) {
  const [description, setDescription] = useState('')
  const [sessions, setSessions] = useState<Array<{ projectName: string }>>([])

  useEffect(() => {
    fetch('/api/sessions').then((r) => r.json()).then(setSessions).catch(() => {})
  }, [])

  const handleSubmit = () => {
    if (!description.trim()) return
    onStart(description.trim())
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        {/* Wordmark */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground">
              <Rocket className="w-4 h-4 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">LaunchPad</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your first step toward AI-powered coding.
            <br />
            Build a real project. Learn every command. Graduate to Claude Code.
          </p>
        </div>

        {/* SSH step */}
        <div className="mb-8 rounded-md border bg-muted/40 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Step 1 — Open your terminal</span>
          </div>
          <code className="block text-sm font-mono text-foreground">
            ssh localhost -p 2222
          </code>
          <p className="text-xs text-muted-foreground">Keep that window open. Your mentor watches what you type.</p>
        </div>

        {/* Resume sessions */}
        <AnimatePresence>
          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Resume</p>
              <div className="space-y-1">
                {sessions.map((s) => (
                  <button
                    key={s.projectName}
                    onClick={() => onResume?.(s.projectName)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md border bg-background hover:bg-accent text-left transition-colors group"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm flex-1">{s.projectName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <Separator className="mt-5 mb-5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Step 2 — What do you want to build?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="A portfolio site for my photography…"
            className="w-full h-10 px-3 text-sm bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition"
            autoFocus
          />
        </div>

        {/* Templates */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-2">Or pick a starting point:</p>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => setDescription(t.description)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors group text-sm',
                  description === t.description
                    ? 'border-foreground bg-accent'
                    : 'bg-background hover:bg-accent hover:border-border'
                )}
              >
                <t.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                <span className="text-xs font-medium truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Launch */}
        <Button
          onClick={handleSubmit}
          disabled={!description.trim() || !connected}
          className="w-full gap-2"
        >
          <Rocket className="w-4 h-4" />
          Launch project
        </Button>

        {!connected && (
          <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Connecting to server…
          </p>
        )}
      </motion.div>
    </div>
  )
}
