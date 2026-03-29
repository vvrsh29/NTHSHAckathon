import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  TerminalSquare,
  Sparkles,
  Code2,
  Zap,
  Settings,
  ExternalLink,
  BookOpen,
  Github,
  MessageCircle,
  ChevronRight,
  Layers,
  Wrench,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CourseLevel, PhaseDefinition, EnvDetectionResult } from '../../shared/types'

interface Props {
  userName: string
  courseLevel: CourseLevel | null
  coursePhases: PhaseDefinition[]
  currentPhase: string
  stepIndex: number
  envResults: EnvDetectionResult | null
  onContinue: () => void
  onChangeCourse: () => void
}

const LEVEL_CONFIG: Record<CourseLevel, { icon: typeof Sparkles; label: string; color: string; accent: string }> = {
  beginner: { icon: Sparkles, label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', accent: 'text-emerald-500' },
  intermediate: { icon: Code2, label: 'Intermediate', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', accent: 'text-blue-500' },
  advanced: { icon: Zap, label: 'Advanced', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', accent: 'text-purple-500' },
}

const RESOURCES = [
  { title: 'Claude Code Docs', desc: 'Official documentation', href: 'https://docs.anthropic.com/en/docs/claude-code/overview', icon: BookOpen },
  { title: 'Anthropic Console', desc: 'Manage your API key', href: 'https://console.anthropic.com', icon: ExternalLink },
  { title: 'GitHub', desc: 'Source code & issues', href: 'https://github.com/anthropics/claude-code', icon: Github },
  { title: 'Community', desc: 'Get help & share', href: 'https://github.com/anthropics/claude-code/discussions', icon: MessageCircle },
]

// ─── SVG Ring Chart ──────────────────────────────────────────────────────────

function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/50"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-emerald-500 transition-all duration-700 ease-out"
      />
    </svg>
  )
}

// ─── Stagger animation helpers ───────────────────────────────────────────────

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomeScreen({
  userName,
  courseLevel,
  coursePhases,
  currentPhase,
  stepIndex,
  envResults,
  onContinue,
  onChangeCourse,
}: Props) {
  const [sshCopied, setSshCopied] = useState(false)

  const currentPhaseIdx = coursePhases.findIndex((p) => p.id === currentPhase)
  const completedPhases = Math.max(currentPhaseIdx, 0)
  const totalPhases = coursePhases.length
  const progressPct = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0
  const levelConfig = courseLevel ? LEVEL_CONFIG[courseLevel] : null

  // Count total steps across all phases and completed steps
  const totalSteps = coursePhases.reduce((sum, p) => sum + p.steps.length, 0)
  const completedSteps = coursePhases.slice(0, completedPhases).reduce((sum, p) => sum + p.steps.length, 0) + stepIndex

  // Env tools count
  const envTools = envResults
    ? [envResults.git, envResults.node, envResults.python, envResults.claudeCode, envResults.vscode].filter(t => t.installed).length
    : 0
  const envTotal = 5

  const handleCopySSH = async () => {
    await navigator.clipboard.writeText('ssh localhost -p 2222')
    setSshCopied(true)
    setTimeout(() => setSshCopied(false), 2000)
  }

  const currentPhaseDef = coursePhases[currentPhaseIdx]
  const subtitle = completedPhases === 0
    ? 'Ready to start your learning journey?'
    : progressPct >= 100
      ? "You've completed the course!"
      : `You're ${progressPct}% through — keep going!`

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-6 py-10 space-y-6"
      >
        {/* ── Welcome Banner ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {userName ? `Hey, ${userName}!` : 'Welcome back!'}
              </h1>
              {levelConfig && (
                <Badge variant="outline" className={cn('text-xs font-medium', levelConfig.color)}>
                  <levelConfig.icon className="w-3 h-3 mr-1" />
                  {levelConfig.label}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          <Button size="lg" onClick={onContinue} className="gap-2 px-6 flex-shrink-0">
            Continue Learning <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Progress Ring */}
          <div className="border rounded-xl p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing progress={progressPct} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{progressPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Progress</p>
              <p className="text-sm font-semibold mt-0.5">{completedPhases} of {totalPhases} phases</p>
            </div>
          </div>

          {/* Current Phase */}
          <div className="border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Current Phase</p>
            </div>
            <p className="text-sm font-semibold truncate">
              {currentPhaseDef?.title || currentPhaseDef?.id || 'Not started'}
            </p>
            {currentPhaseDef && (
              <p className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {currentPhaseDef.steps.length}
              </p>
            )}
          </div>

          {/* Tools Ready */}
          <div className="border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tools Ready</p>
            </div>
            <p className="text-sm font-semibold">{envTools} of {envTotal} installed</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(envTools / envTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Total Steps */}
          <div className="border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Steps Done</p>
            </div>
            <p className="text-sm font-semibold">{completedSteps} of {totalSteps}</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/70 rounded-full transition-all duration-500"
                style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Two-Column Layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left — Phase Breakdown (3 cols) */}
          <motion.div variants={fadeUp} className="lg:col-span-3 border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Phase Breakdown
            </h2>

            {/* Horizontal progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-1">
              {coursePhases.map((phase, i) => {
                const done = i < currentPhaseIdx
                const active = i === currentPhaseIdx
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                      active ? 'bg-accent border border-border' : 'hover:bg-muted/40'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                        done ? 'bg-emerald-500 text-white' :
                        active ? 'bg-foreground text-background' :
                        'bg-muted text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        done ? 'text-muted-foreground' : active ? 'text-foreground' : 'text-muted-foreground/60'
                      )}>
                        {phase.title || phase.id}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {phase.steps.length} steps
                    </span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  </div>
                )
              })}
              {coursePhases.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Course loads when you continue.
                </p>
              )}
            </div>
          </motion.div>

          {/* Right Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Actions */}
            <motion.div variants={fadeUp} className="border rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={onContinue}>
                  <Rocket className="w-3.5 h-3.5" /> Resume Course
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={onChangeCourse}>
                  <Settings className="w-3.5 h-3.5" /> Change Course
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={handleCopySSH}>
                  <TerminalSquare className="w-3.5 h-3.5" />
                  {sshCopied ? 'Copied!' : 'Copy SSH Command'}
                  {sshCopied && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                </Button>
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div variants={fadeUp} className="border rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Resources
              </h2>
              <div className="space-y-1">
                {RESOURCES.map(({ title, desc, href, icon: Icon }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium group-hover:text-foreground transition-colors">{title}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Environment (compact) */}
            {envResults && (
              <motion.div variants={fadeUp} className="border rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Environment
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {[
                    { label: 'Git', ok: envResults.git.installed },
                    { label: 'Node.js', ok: envResults.node.installed },
                    { label: 'Python', ok: envResults.python.installed },
                    { label: 'Claude Code', ok: envResults.claudeCode.installed },
                    { label: 'VS Code', ok: envResults.vscode.installed },
                    ...(envResults.platform === 'macos' ? [{ label: 'Xcode CLT', ok: envResults.xcodeClT.installed }] : []),
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-1.5">
                      {t.ok ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="text-[11px] text-muted-foreground">{t.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
