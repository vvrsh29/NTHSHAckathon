import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Phase } from '../../shared/types'

const phases: { id: Phase; label: string }[] = [
  { id: 'setup', label: 'Setup' },
  { id: 'scaffold', label: 'Scaffold' },
  { id: 'build', label: 'Build' },
  { id: 'style', label: 'Style' },
  { id: 'deploy', label: 'Deploy' },
]

interface Props {
  currentPhase: Phase
  stepIndex: number
}

export default function StepIndicator({ currentPhase }: Props) {
  const currentIdx = phases.findIndex((p) => p.id === currentPhase)

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
                active ? 'bg-foreground text-background ring-2 ring-foreground/20' :
                'bg-muted text-muted-foreground'
              )}>
                {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors hidden sm:block',
                active ? 'text-foreground' : 'text-muted-foreground'
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
