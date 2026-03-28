import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ExternalLink, Monitor } from 'lucide-react'

interface Props {
  projectName?: string
}

export default function PreviewPane({ projectName }: Props) {
  const [key, setKey] = useState(0)
  // Assume projects are served on port 8080 by default (user runs `python3 -m http.server 8080`)
  const previewUrl = 'http://localhost:8080'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-surface-1">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">
            {previewUrl}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex-1 relative">
        <motion.iframe
          key={key}
          src={previewUrl}
          className="w-full h-full border-0 bg-white"
          title="Project Preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onError={() => {}}
        />
        {/* Overlay shown when iframe fails to load */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 pointer-events-none"
          style={{ display: 'none' }}
        >
          <Monitor className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm text-center px-4">
            Preview will appear here once you run your project
          </p>
          <p className="text-gray-600 text-xs mt-2 text-center px-4">
            Run: <code className="bg-surface-2 px-1.5 py-0.5 rounded">python3 -m http.server 8080</code>
          </p>
        </div>
      </div>
    </div>
  )
}
