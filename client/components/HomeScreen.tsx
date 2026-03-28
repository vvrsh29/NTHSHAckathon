import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  Copy,
  Check,
  TerminalSquare,
  Sparkles,
  Code2,
  Zap,
  Settings,
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

const LEVEL_CONFIG: Record<CourseLevel, { icon: typeof Sparkles; label: string; color: string }> = {
  beginner: { icon: Sparkles, label: 'Beginner', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  intermediate: { icon: Code2, label: 'Intermediate', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  advanced: { icon: Zap, label: 'Advanced', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
}

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

  const handleCopySSH = async () => {
    await navigator.clipboard.writeText('ssh localhost -p 2222')
    setSshCopied(true)
    setTimeout(() => setSshCopied(false), 2000)
  }

  const levelConfig = courseLevel ? LEVEL_CONFIG[courseLevel] : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl w-full space-y-6"
        >
          {/* Greeting */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {userName ? `Hey, ${userName}!` : 'Welcome back!'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Pick up where you left off or explore your setup.
            </p>
          </div>

          {/* Course Progress Card */}
          <div className="border rounded-xl p-6 space-y-5 bg-background">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Learning Path
              </h2>
              {levelConfig && (
                <Badge variant="outline" className={cn('text-xs font-medium', levelConfig.color)}>
                  {levelConfig.label}
                </Badge>
              )}
            </div>

            {/* Phase progress (vertical) */}
            {coursePhases.length > 0 ? (
              <div className="space-y-0">
                {coursePhases.map((phase, i) => {
                  const done = i < currentPhaseIdx
                  const active = i === currentPhaseIdx
                  return (
                    <div key={phase.id} className="flex items-start gap-3">
                      {/* Vertical line + icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                            done
                              ? 'bg-emerald-500 text-white'
                              : active
                                ? 'bg-foreground text-background ring-2 ring-foreground/20'
                                : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {done ? (
                            <Check className="w-3 h-3" />
                          ) : active ? (
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          ) : (
                            <Circle className="w-2.5 h-2.5" />
                          )}
                        </div>
                        {i < coursePhases.length - 1 && (
                          <div
                            className={cn(
                              'w-px h-6',
                              done ? 'bg-emerald-500/40' : 'bg-border'
                            )}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-0.5 pb-3">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            active ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-muted-foreground/60'
                          )}
                        >
                          {phase.title || phase.id}
                        </p>
                        {active && phase.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}

                <p className="text-xs text-muted-foreground mt-2">
                  Phase {Math.max(currentPhaseIdx + 1, 1)} of {coursePhases.length}
                  {stepIndex > 0 && ` — Step ${stepIndex + 1}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your course will load when you continue.
              </p>
            )}

            {/* Continue button */}
            <Button size="lg" onClick={onContinue} className="w-full gap-2">
              Continue Learning <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Change course */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onChangeCourse}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Settings className="w-3 h-3" />
                Change Course
              </Button>
            </div>
          </div>

          {/* Environment Status Card */}
          {envResults && (
            <div className="border rounded-xl p-6 space-y-4 bg-background">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your Environment
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Git', installed: envResults.git.installed, version: envResults.git.version },
                  { label: 'Node.js', installed: envResults.node.installed, version: envResults.node.version },
                  { label: 'Python', installed: envResults.python.installed, version: envResults.python.version },
                  { label: 'Claude Code', installed: envResults.claudeCode.installed, version: envResults.claudeCode.version },
                  { label: 'VS Code', installed: envResults.vscode.installed },
                  ...(envResults.platform === 'macos'
                    ? [{ label: 'Xcode CLT', installed: envResults.xcodeClT.installed }]
                    : []),
                ].map((tool) => (
                  <div
                    key={tool.label}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md text-sm"
                  >
                    {tool.installed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span className={cn('text-xs', tool.installed ? 'text-foreground' : 'text-amber-500')}>
                      {tool.label}
                    </span>
                    {'version' in tool && tool.version && (
                      <span className="text-[10px] text-muted-foreground">{tool.version}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SSH Access Card */}
          <div className="border rounded-xl p-6 space-y-3 bg-background">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Terminal Access
            </h2>
            <p className="text-xs text-muted-foreground">
              Or connect via your own terminal:
            </p>
            <div className="flex items-center gap-2 bg-muted/60 border rounded-md px-3 py-2 font-mono text-sm group">
              <TerminalSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <code className="flex-1 text-foreground text-xs">ssh localhost -p 2222</code>
              <button
                onClick={handleCopySSH}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
              >
                {sshCopied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
