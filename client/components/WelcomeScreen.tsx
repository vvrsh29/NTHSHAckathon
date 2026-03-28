import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Code2, Layout, BookOpen, Sparkles, Terminal, RotateCcw } from 'lucide-react'

interface Props {
  onStart: (description: string, apiKey?: string) => void
  onResume?: (projectName: string) => void
  connected: boolean
}

const templates = [
  { icon: Layout, label: 'Portfolio Site', description: 'A personal portfolio to showcase your work' },
  { icon: BookOpen, label: 'Blog', description: 'A simple blog with posts and a reading layout' },
  { icon: Code2, label: 'Landing Page', description: 'A product or project landing page' },
  { icon: Sparkles, label: 'To-Do App', description: 'An interactive to-do list with add and delete' },
]

export default function WelcomeScreen({ onStart, onResume, connected }: Props) {
  const [description, setDescription] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [sessions, setSessions] = useState<Array<{ projectName: string }>>([])

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => {})
  }, [])

  const handleSubmit = () => {
    if (!description.trim()) return
    onStart(description.trim(), apiKey.trim() || undefined)
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 mb-4"
          >
            <Rocket className="w-8 h-8 text-brand-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">LaunchPad</h1>
          <p className="text-gray-400 text-lg">Learn to build websites with AI as your mentor</p>
        </div>

        {/* SSH instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wide">Step 1 — Open your terminal</span>
          </div>
          <p className="text-gray-300 text-sm mb-2">
            Open a terminal on your computer and connect:
          </p>
          <code className="block bg-black/40 text-purple-200 px-4 py-2 rounded-lg font-mono text-sm border border-purple-500/10">
            ssh localhost -p 2222
          </code>
          <p className="text-xs text-gray-500 mt-2">
            Keep that window open — your AI mentor will watch what you type.
          </p>
        </motion.div>

        {/* Resume sessions */}
        <AnimatePresence>
          {sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Resume a project:</p>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.projectName}
                    onClick={() => onResume?.(s.projectName)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-surface-1 hover:border-brand-500/30 hover:bg-surface-2 transition text-left"
                  >
                    <RotateCcw className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-200">{s.projectName}</div>
                      <div className="text-xs text-gray-500">Continue where you left off</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Or start something new:</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What do you want to build?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g., A portfolio site for my photography..."
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition text-lg"
            autoFocus
          />
        </div>

        {/* Templates */}
        <div className="mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Or pick a template:</p>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => setDescription(t.description)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-surface-1 hover:border-brand-500/30 hover:bg-surface-2 transition text-left group"
              >
                <t.icon className="w-5 h-5 text-gray-500 group-hover:text-brand-400 transition" />
                <div>
                  <div className="text-sm font-medium text-gray-200">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API key */}
        <div className="mb-8">
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            {showApiKey ? '▾' : '▸'} Configure API key (optional)
          </button>
          {showApiKey && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2"
            >
              <p className="text-xs text-gray-500 mb-2">
                Enter your Gemini API key for AI-powered explanations.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza... (optional if set in .env)"
                className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
              />
            </motion.div>
          )}
        </div>

        {/* Launch button */}
        <motion.button
          whileHover={{ scale: connected ? 1.02 : 1 }}
          whileTap={{ scale: connected ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!description.trim() || !connected}
          className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
        >
          <Rocket className="w-5 h-5" />
          Launch!
        </motion.button>

        {!connected && (
          <div className="text-center mt-3 space-y-1">
            <p className="text-yellow-400 text-sm flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Connecting to server...
            </p>
            <p className="text-gray-500 text-xs">
              Make sure the server is running: <code className="bg-surface-2 px-1 rounded">npm run dev</code>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
