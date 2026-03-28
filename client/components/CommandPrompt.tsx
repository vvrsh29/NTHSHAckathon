import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Terminal, Keyboard } from 'lucide-react'
import type { ClientMessage } from '../../shared/types'

interface Props {
  command: string
  explanation: string
  send?: (msg: ClientMessage) => void
}

// Split command into tokens for tooltip display
function tokenize(cmd: string) {
  return cmd.split(' ').filter(Boolean)
}

const TOKEN_HINTS: Record<string, string> = {
  mkdir: 'Make directory — creates a new folder',
  cd: 'Change directory — move into a folder',
  ls: 'List — show files in current directory',
  npm: 'Node Package Manager',
  npx: 'Run an npm package directly',
  git: 'Version control system',
  init: 'Initialize / set up',
  install: 'Download and install packages',
  touch: 'Create an empty file',
  echo: 'Print text or write to a file',
  python3: 'Run Python 3',
  node: 'Run Node.js',
  '--save-dev': 'Install as development dependency',
  '-y': 'Auto-yes to all prompts',
}

function Token({ token }: { token: string }) {
  const hint = TOKEN_HINTS[token]
  const [show, setShow] = useState(false)

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => hint && setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={`${hint ? 'cursor-help border-b border-dashed border-emerald-500/40' : ''}`}
      >
        {token}
      </span>
      {hint && show && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 bg-gray-900 text-gray-200 text-xs rounded-lg px-2.5 py-2 border border-white/10 shadow-xl pointer-events-none text-center leading-snug"
        >
          {hint}
        </motion.span>
      )}
    </span>
  )
}

export default function CommandPrompt({ command, explanation, send }: Props) {
  const [copied, setCopied] = useState(false)
  const [ghosted, setGhosted] = useState(false)
  const tokens = tokenize(command)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGhostType = () => {
    if (!send) return
    send({ type: 'ghost_type', command })
    setGhosted(true)
    setTimeout(() => setGhosted(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
          Type this command
        </span>
      </div>

      {/* Command display with token tooltips */}
      <div className="flex items-center gap-2 mb-3">
        <motion.code
          animate={{
            boxShadow: [
              '0 0 0px rgba(52, 211, 153, 0)',
              '0 0 16px rgba(52, 211, 153, 0.2)',
              '0 0 0px rgba(52, 211, 153, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-1 bg-black/40 text-emerald-300 px-4 py-2.5 rounded-lg font-mono text-sm border border-emerald-500/10 flex flex-wrap gap-x-1.5"
        >
          <span className="text-gray-500">$</span>
          {tokens.map((t, i) => (
            <Token key={i} token={t} />
          ))}
        </motion.code>

        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Ghost type button */}
      {send && (
        <button
          onClick={handleGhostType}
          disabled={ghosted}
          className="flex items-center gap-2 text-xs text-emerald-400/70 hover:text-emerald-300 disabled:text-emerald-400/40 transition"
          title="Type this command into the SSH terminal for you"
        >
          <Keyboard className="w-3.5 h-3.5" />
          {ghosted ? 'Typing into terminal...' : 'Help me type this →'}
        </button>
      )}

      <p className="text-xs text-gray-400 mt-2">{explanation}</p>
    </motion.div>
  )
}
