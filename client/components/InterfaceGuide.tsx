import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, Terminal, BookOpen, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    title: 'Your Terminal',
    description:
      'This is a real terminal running on your machine. Every command you type is real — it creates real files and runs real programs.',
    icon: Terminal,
  },
  {
    title: 'Your AI Mentor',
    description:
      "Your mentor explains each step, catches mistakes, and answers questions. It's like having a patient teacher sitting next to you.",
    icon: BookOpen,
  },
  {
    title: 'Your Progress',
    description:
      "Track your progress across phases. Click 'Next Step' when you're ready to move on, or let auto-mode advance for you.",
    icon: BarChart3,
  },
]

export default function InterfaceGuide() {
  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem('launchpad-guide-dismissed')
    } catch {
      return true
    }
  })
  const [step, setStep] = useState(0)

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem('launchpad-guide-dismissed', '1')
    } catch {}
  }

  if (!visible) return null

  const StepIcon = STEPS[step].icon

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background border rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted mx-auto">
            <StepIcon className="w-7 h-7 text-muted-foreground" />
          </div>

          {/* Title + description */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{STEPS[step].title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {STEPS[step].description}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full',
                  i === step ? 'bg-foreground' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={dismiss}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button
              onClick={step < 2 ? () => setStep((s) => s + 1) : dismiss}
              className="gap-2"
            >
              {step < 2 ? 'Next' : "Let's go!"}{' '}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
