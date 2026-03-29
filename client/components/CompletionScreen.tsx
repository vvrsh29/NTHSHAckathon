import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Rocket, ExternalLink, BookOpen, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  userName: string
  onGoHome: () => void
}

export default function CompletionScreen({ userName, onGoHome }: Props) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-lg w-full text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring', bounce: 0.5 }}
          className="flex items-center justify-center mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <Trophy className="w-10 h-10 text-emerald-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            You did it{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            You've completed the course. You now know how to use the terminal,
            set up a dev environment, and build projects with Claude Code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            What's next?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <a
              href="https://docs.anthropic.com/en/docs/claude-code/overview"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border p-4 space-y-2 hover:bg-muted/40 transition-colors group"
            >
              <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <p className="text-xs font-medium">Read the Docs</p>
              <p className="text-[10px] text-muted-foreground">Deep-dive into Claude Code features</p>
            </a>
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border p-4 space-y-2 hover:bg-muted/40 transition-colors group"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <p className="text-xs font-medium">Explore GitHub</p>
              <p className="text-[10px] text-muted-foreground">Source code, issues, discussions</p>
            </a>
            <div className="rounded-xl border p-4 space-y-2">
              <Rocket className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs font-medium">Keep building</p>
              <p className="text-[10px] text-muted-foreground">Start a new project with Claude Code</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="pt-2"
        >
          <Button size="lg" onClick={onGoHome} className="gap-2 px-8">
            Back to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
