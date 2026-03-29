import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onSignIn: (name: string, email: string) => void
}

export default function LoginScreen({ onSignIn }: Props) {
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('launchpad-user-name') || '' } catch { return '' }
  })
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('launchpad-user-email') || '' } catch { return '' }
  })

  const valid = name.trim().length > 0 && email.trim().length > 0

  const handleSubmit = () => {
    if (!valid) return
    try {
      localStorage.setItem('launchpad-user-name', name.trim())
      localStorage.setItem('launchpad-user-email', email.trim())
    } catch {}
    onSignIn(name.trim(), email.trim())
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-lg space-y-8">
          {/* Logo + Name */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground shadow-md">
              <Rocket className="w-6 h-6 text-background" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LaunchPad</h1>
            <p className="text-sm text-muted-foreground text-center">
              Sign in to start your coding journey.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && valid) handleSubmit()
                }}
                placeholder="Your name"
                className="w-full h-11 px-4 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && valid) handleSubmit()
                }}
                placeholder="you@example.com"
                className="w-full h-11 px-4 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!valid}
              className="w-full gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
