import { useState, useEffect } from 'react'
import { BookOpen, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ClientMessage } from '../../shared/types'

interface Props {
  send: (msg: ClientMessage) => void
}

export default function ModeSwitch({ send }: Props) {
  const [mode, setMode] = useState<'tutor' | 'auto'>(() => {
    try { return (localStorage.getItem('launchpad-mode') as 'tutor' | 'auto') || 'tutor' }
    catch { return 'tutor' }
  })

  useEffect(() => { send({ type: 'mode_change', mode }) }, [])

  const toggle = () => {
    const next = mode === 'tutor' ? 'auto' : 'tutor'
    setMode(next)
    try { localStorage.setItem('launchpad-mode', next) } catch {}
    send({ type: 'mode_change', mode: next })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      title={mode === 'tutor' ? 'Tutor: mentor guides each step manually' : 'Auto: steps advance automatically'}
      className="h-6 px-2 text-xs gap-1.5 font-normal"
    >
      {mode === 'tutor' ? <BookOpen className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
      {mode === 'tutor' ? 'Tutor' : 'Auto'}
    </Button>
  )
}
