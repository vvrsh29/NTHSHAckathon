import { Check } from 'lucide-react'
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
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture = i > currentIdx

        return (
          <div key={phase.id} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 h-px mx-1 ${
                  isCompleted ? 'bg-brand-400' : 'bg-white/10'
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted
                    ? 'bg-brand-500 text-white'
                    : isCurrent
                    ? 'bg-brand-600/30 text-brand-300 ring-2 ring-brand-500/50'
                    : 'bg-white/5 text-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  isCurrent ? 'text-brand-300 font-medium' : isFuture ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {phase.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
