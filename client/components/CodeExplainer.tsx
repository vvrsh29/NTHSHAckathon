import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, FileCode, Copy, Check } from 'lucide-react'
import type { GeneratedFile } from '../../shared/types'

interface Props {
  files: GeneratedFile[]
  explanation: string
}

function FileSection({ file }: { file: GeneratedFile }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const ext = file.path.split('.').pop() || ''
  const langMap: Record<string, string> = {
    html: 'HTML',
    css: 'CSS',
    js: 'JavaScript',
    ts: 'TypeScript',
    json: 'JSON',
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(file.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface-3 transition text-left"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <FileCode className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-medium text-gray-200 flex-1">{file.path}</span>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
          {langMap[ext] || ext.toUpperCase()}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-surface-1 border-t border-white/5">
              <p className="text-xs text-gray-400 mb-2">{file.explanation}</p>
              <div className="relative">
                <pre className="bg-black/40 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto max-h-80">
                  <code>{file.content}</code>
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 transition"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CodeExplainer({ files, explanation }: Props) {
  if (files.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 mb-2">
        <FileCode className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-medium text-brand-300 uppercase tracking-wide">
          Generated Code
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-3">{explanation}</p>
      <div className="space-y-2">
        {files.map((file) => (
          <FileSection key={file.path} file={file} />
        ))}
      </div>
    </motion.div>
  )
}
