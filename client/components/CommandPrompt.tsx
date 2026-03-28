import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Terminal } from 'lucide-react'

interface Props {
  command: string
  explanation: string
}

export default function CommandPrompt({ command, explanation }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

      <div className="flex items-center gap-2">
        <motion.code
          animate={{
            boxShadow: [
              '0 0 0px rgba(52, 211, 153, 0)',
              '0 0 12px rgba(52, 211, 153, 0.15)',
              '0 0 0px rgba(52, 211, 153, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-1 bg-black/40 text-emerald-300 px-4 py-2.5 rounded-lg font-mono text-sm border border-emerald-500/10"
        >
          $ {command}
        </motion.code>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">{explanation}</p>
    </motion.div>
  )
}
