import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Code2, Layout, BookOpen, Sparkles, Terminal, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  onStart: (description: string) => void
  onResume?: (projectName: string) => void
  connected: boolean
}

const templates = [
  { icon: Layout,   label: 'Portfolio Site', description: 'A personal portfolio to showcase your work' },
  { icon: BookOpen, label: 'Blog',           description: 'A simple blog with posts and a reading layout' },
  { icon: Code2,    label: 'Landing Page',   description: 'A product or project landing page' },
  { icon: Sparkles, label: 'To-Do App',      description: 'An interactive to-do list with add and delete' },
]

const perks = [
  'Real terminal — real commands, real files',
  'AI mentor explains every step in plain English',
  'Graduate to Claude Code when you\'re ready',
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 lg:p-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
      >

        {/* ── Left column: branding + context ── */}
        <div className="flex flex-col gap-8">

          {/* Wordmark */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground">
                <Rocket className="w-4.5 h-4.5 text-background" />
              </div>
              <span className="text-xl font-semibold tracking-tight">LaunchPad</span>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
              Build a real project. Learn every command.
              <br />
              Graduate to Claude Code.
            </p>
          </div>

          {/* Step 1 — SSH */}
          <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Step 1 — Open your terminal
              </span>
            </div>
            <code className="block text-sm font-mono text-foreground bg-background border rounded-md px-3 py-2.5">
              ssh localhost -p 2222
            </code>
            <p className="text-xs text-muted-foreground">
              Keep that window open. Your mentor watches what you type and explains in real time.
            </p>
          </div>

          {/* What you get */}
          <div className="space-y-2.5">
            {perks.map((p) => (
              <div key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {p}
              </div>
            ))}
          </div>

          {/* Resume sessions */}
          <AnimatePresence>
            {sessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Separator className="mb-5" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Resume a project
                </p>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column: the actual form ── */}
        <div className="flex flex-col gap-6 lg:pt-2">

          <div>
            <h2 className="text-lg font-semibold mb-1">What do you want to build?</h2>
            <p className="text-sm text-muted-foreground">
              Describe your project or pick a starting point below.
            </p>
          </div>

          {/* Description input */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="A portfolio site for my photography…"
            className="w-full h-11 px-4 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            autoFocus
          />

          {/* Template grid */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Or start from a template:</p>
            <div className="grid grid-cols-2 gap-2.5">
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setDescription(t.description)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-colors group',
                    description === t.description
                      ? 'border-foreground bg-accent'
                      : 'bg-background hover:bg-accent hover:border-border'
                  )}
                >
                  <t.icon className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    description === t.description ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none mb-0.5">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug truncate">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Launch */}
          <div className="space-y-2 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || !connected}
              size="lg"
              className="w-full gap-2 h-11"
            >
              <Rocket className="w-4 h-4" />
              Launch project
            </Button>
            {!connected ? (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Connecting to server…
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Step 2 of 2 — SSH must be open first
              </p>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  )
}
