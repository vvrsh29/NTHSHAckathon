import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Code2,
  Zap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CourseLevel, EnvDetectionResult } from '../../shared/types'

interface Props {
  onComplete: (config: { level: CourseLevel; apiKey: string; buildIdea: string; userName: string; userRole: string }) => void
  onBack: () => void
}

const LEVELS: Array<{
  value: CourseLevel
  icon: typeof Sparkles
  title: string
  bullets: string[]
  time: string
}> = [
  {
    value: 'beginner',
    icon: Sparkles,
    title: "I'm brand new",
    bullets: [
      'Learn the terminal from scratch',
      'Set up Git, Node.js, VS Code',
      'Install & use Claude Code',
      'Build your first project',
    ],
    time: '~30 min',
  },
  {
    value: 'intermediate',
    icon: Code2,
    title: 'I know the basics',
    bullets: [
      'Quick environment check',
      'Jump straight to Claude Code',
      'Build something real',
      'Learn tips & tricks',
    ],
    time: '~15 min',
  },
  {
    value: 'advanced',
    icon: Zap,
    title: 'Show me everything',
    bullets: [
      'CLAUDE.md best practices',
      'MCP servers & tools',
      'Hooks & permissions',
      'Agent patterns',
    ],
    time: '~10 min',
  },
]

const QUICK_PICKS = ['Todo App', 'Portfolio Site', 'Weather App', 'Chat Bot']

const ROLES = ['Student', 'Professional', 'Hobbyist', 'Curious']

const TOTAL_STAGES = 6 // 0-5; stage 5 only for beginners

export default function Onboarding({ onComplete, onBack }: Props) {
  const [stage, setStage] = useState(0)
  const [level, setLevel] = useState<CourseLevel | null>(null)
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [envResults, setEnvResults] = useState<EnvDetectionResult | null>(null)
  const [envLoading, setEnvLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('launchpad-anthropic-key') || ''
    } catch {
      return ''
    }
  })
  const [buildIdea, setBuildIdea] = useState('')
  const [skippedKey, setSkippedKey] = useState(false)

  const persistKey = (value: string) => {
    setApiKey(value)
    try {
      localStorage.setItem('launchpad-anthropic-key', value)
    } catch {}
  }

  const finish = (idea: string = buildIdea) => {
    onComplete({ level: level!, apiKey: apiKey.trim(), buildIdea: idea.trim(), userName: userName.trim(), userRole })
  }

  // After stage 4 (API Key), non-beginners skip stage 5 (build idea)
  const handleContinueFromApiKey = () => {
    if (level === 'beginner') {
      setStage(5)
    } else {
      finish('')
    }
  }

  // Fetch env detection when entering stage 3
  useEffect(() => {
    if (stage === 3 && !envResults) {
      setEnvLoading(true)
      fetch('/api/env')
        .then(r => r.json())
        .then((data: EnvDetectionResult) => { setEnvResults(data); setEnvLoading(false) })
        .catch(() => setEnvLoading(false))
    }
  }, [stage, envResults])

  // How many stages are visible for this level
  const visibleStages = level === 'beginner' ? TOTAL_STAGES : TOTAL_STAGES - 1

  // Slide animation
  const slideVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -80 },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar: back button + stage dots */}
      <div className="flex-none flex items-center justify-between h-14 px-6">
        {stage > 0 ? (
          <button
            onClick={() => (stage === 0 ? onBack() : setStage(stage - 1))}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        )}

        {/* Stage dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: visibleStages }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === stage
                  ? 'bg-foreground scale-110'
                  : i < stage
                    ? 'bg-foreground/40'
                    : 'bg-muted-foreground/20'
              )}
            />
          ))}
        </div>

        {/* Spacer to balance layout */}
        <div className="w-16" />
      </div>

      {/* Stage content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ── Stage 0: Welcome ── */}
          {stage === 0 && (
            <motion.div
              key="stage-0"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-lg w-full text-center space-y-8"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex items-center justify-center mx-auto"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground shadow-lg">
                  <Rocket className="w-7 h-7 text-background" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Learn to code with AI
                </h1>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  LaunchPad teaches you the terminal, sets up your dev environment, and walks you
                  through building your first project with Claude Code.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
              >
                <Button size="lg" onClick={() => setStage(1)} className="gap-2 px-8">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Stage 1: About You ── */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-xl bg-muted">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  First, tell us about yourself
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">What should we call you?</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim()) setStage(2)
                    }}
                    placeholder="Your name"
                    className="w-full h-11 px-4 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">What best describes you?</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => setUserRole(role)}
                        className={cn(
                          'px-3.5 py-1.5 text-xs rounded-full border transition-all duration-150',
                          userRole === role
                            ? 'border-foreground bg-accent text-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setStage(2)}
                  disabled={!userName.trim()}
                  className="gap-2 px-8"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Stage 2: Skill Level ── */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-3xl w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  What's your experience level?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LEVELS.map(({ value, icon: Icon, title, bullets, time }) => (
                  <button
                    key={value}
                    onClick={() => setLevel(value)}
                    className={cn(
                      'text-left rounded-xl border p-5 transition-all duration-200 space-y-4 hover:border-foreground/40',
                      level === value
                        ? 'border-foreground bg-accent'
                        : 'bg-background border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
                          level === value ? 'bg-foreground' : 'bg-muted'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 transition-colors',
                            level === value ? 'text-background' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <span className="font-semibold text-sm">{title}</span>
                    </div>

                    <ul className="space-y-1.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <p className="text-xs text-muted-foreground/60 font-medium">{time}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setStage(3)}
                  disabled={!level}
                  className="gap-2 px-8"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Stage 3: Environment Check ── */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {envLoading ? 'Checking your environment...' : 'Your environment'}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {envLoading
                    ? 'Detecting installed tools on your machine.'
                    : "Here's what we found on your machine."}
                </p>
              </div>

              {envLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
              ) : envResults ? (
                <div className="space-y-3">
                  {[
                    { label: 'Git', installed: envResults.git.installed, version: envResults.git.version },
                    { label: 'Node.js', installed: envResults.node.installed, version: envResults.node.version },
                    { label: 'Python', installed: envResults.python.installed, version: envResults.python.version },
                    { label: 'Claude Code', installed: envResults.claudeCode.installed, version: envResults.claudeCode.version },
                    { label: 'VS Code', installed: envResults.vscode.installed },
                    ...(envResults.platform === 'macos'
                      ? [{ label: 'Xcode CLT', installed: envResults.xcodeClT.installed }]
                      : []),
                  ].map((tool, i) => (
                    <motion.div
                      key={tool.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.08 }}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg border bg-background"
                    >
                      {tool.installed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{tool.label}</span>
                        {tool.installed && 'version' in tool && tool.version && (
                          <span className="text-xs text-muted-foreground ml-2">{tool.version}</span>
                        )}
                        {!tool.installed && (
                          <p className="text-[11px] text-amber-500/80 mt-0.5">
                            We'll help you install this during the course
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Could not detect environment. No worries — we'll set everything up together.
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setStage(4)}
                  className="gap-2 px-8"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Stage 4: API Key ── */}
          {stage === 4 && (
            <motion.div
              key="stage-4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Connect your Anthropic API key
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This key powers your AI mentor and lets you use Claude Code.
                </p>
              </div>

              <div className="space-y-4">
                {/* Input */}
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      persistKey(e.target.value)
                      setSkippedKey(false)
                    }}
                    placeholder="sk-ant-..."
                    className="w-full h-11 pl-10 pr-10 text-sm font-mono bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  {apiKey && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>

                {/* Link */}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get your API key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Continue */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={handleContinueFromApiKey}
                  disabled={!apiKey.trim() && !skippedKey}
                  className="w-full gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Skip option */}
                {!apiKey.trim() && !skippedKey && (
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setSkippedKey(true)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                )}

                {skippedKey && !apiKey.trim() && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Without a key, you'll only get basic tutorials — no AI mentor.
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleContinueFromApiKey}
                      className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500"
                    >
                      Continue without key
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Stage 5: What to Build (Beginner only) ── */}
          {stage === 5 && (
            <motion.div
              key="stage-5"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-md w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  What would you like to build?
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We'll use Claude Code to build this together. Don't worry, you can change your
                  mind later.
                </p>
              </div>

              {/* Text input */}
              <input
                type="text"
                value={buildIdea}
                onChange={(e) => setBuildIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && buildIdea.trim()) finish()
                }}
                placeholder="A todo app, a personal website, a weather dashboard..."
                className="w-full h-11 px-4 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                autoFocus
              />

              {/* Quick-pick chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PICKS.map((pick) => (
                  <button
                    key={pick}
                    onClick={() => setBuildIdea(pick)}
                    className={cn(
                      'px-3.5 py-1.5 text-xs rounded-full border transition-all duration-150',
                      buildIdea === pick
                        ? 'border-foreground bg-accent text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    )}
                  >
                    {pick}
                  </button>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" onClick={() => finish('')} className="text-muted-foreground">
                  Skip
                </Button>
                <Button
                  size="lg"
                  onClick={() => finish()}
                  disabled={!buildIdea.trim()}
                  className="gap-2 px-8"
                >
                  Let's go! <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
