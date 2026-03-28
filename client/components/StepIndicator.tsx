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
    <div className="flex items-center gap-0.5">
      {phases.map((phase, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture = i > currentIdx

        return (
          <div key={phase.id} className="flex items-center">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={`w-5 h-px mx-1 ${
                  isCompleted ? 'bg-green-500/60' : 'bg-white/10'
                }`}
              />
            )}

            {/* Step node + label */}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-brand-500 text-white ring-2 ring-brand-400/50'
                    : 'bg-white/5 text-gray-600'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
              </div>
              <span
                className={`text-[10px] leading-none font-medium transition-all ${
                  isCurrent
                    ? 'text-brand-300'
                    : isCompleted
                    ? 'text-green-400/70'
                    : 'text-gray-600'
                }`}
              >
                {phase.label}
              </span>
              {/* Current phase dot indicator */}
              {isCurrent && (
                <span className="w-1 h-1 rounded-full bg-brand-400" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
