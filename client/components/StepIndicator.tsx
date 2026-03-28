import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  phases: Array<{ id: string; label: string }>
  currentPhase: string
  stepIndex: number
}

export default function StepIndicator({ phases, currentPhase, stepIndex }: Props) {
  const currentIdx = phases.findIndex((p) => p.id === currentPhase)

  if (phases.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, i) => {
        const done = i < currentIdx
        const active = i === currentIdx

        return (
          <div key={phase.id} className="flex items-center gap-1">
            {i > 0 && <div className={cn('w-4 h-px', done ? 'bg-foreground/40' : 'bg-border')} />}
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold transition-colors',
                done ? 'bg-foreground text-background' :
                active ? 'bg-foreground text-background ring-2 ring-foreground/20 animate-pulse' :
                'bg-muted text-muted-foreground'
              )}>
                {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'block text-foreground' : 'hidden sm:block text-muted-foreground'
              )}>
                {phase.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
