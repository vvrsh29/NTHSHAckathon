import { useState, useEffect } from 'react'
import { BookOpen, Zap } from 'lucide-react'
import type { ClientMessage } from '../../shared/types'

interface ModeSwitchProps {
  send: (msg: ClientMessage) => void
}

export default function ModeSwitch({ send }: ModeSwitchProps) {
  const [mode, setMode] = useState<'tutor' | 'auto'>(() => {
    try {
      return (localStorage.getItem('launchpad-mode') as 'tutor' | 'auto') || 'tutor'
    } catch {
      return 'tutor'
    }
  })

  useEffect(() => {
    send({ type: 'mode_change', mode })
  }, []) // sync initial mode to server on mount

  const toggle = () => {
    const next = mode === 'tutor' ? 'auto' : 'tutor'
    setMode(next)
    try { localStorage.setItem('launchpad-mode', next) } catch {}
    send({ type: 'mode_change', mode: next })
  }

  const isTutor = mode === 'tutor'

  return (
    <button
      onClick={toggle}
      title={isTutor ? 'Tutor mode: mentor guides each step manually' : 'Auto mode: steps advance automatically'}
      className={[
        'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        'border transition-all duration-200 select-none cursor-pointer',
        isTutor
          ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 hover:bg-brand-500/30'
          : 'bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30',
      ].join(' ')}
    >
      {isTutor ? (
        <><BookOpen size={12} /><span>Tutor</span></>
      ) : (
        <><Zap size={12} /><span>Auto</span></>
      )}
    </button>
  )
}
