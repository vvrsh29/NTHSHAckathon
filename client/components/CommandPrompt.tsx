import { useState } from 'react'
import { Copy, Check, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ClientMessage } from '../../shared/types'

interface Props {
  command: string
  send?: (msg: ClientMessage) => void
}

const TOKEN_HINTS: Record<string, string> = {
  mkdir: 'Make directory — creates a new folder',
  cd: 'Change directory — move into a folder',
  ls: 'List — show files in the current directory',
  npm: 'Node Package Manager',
  npx: 'Run an npm package directly without installing',
  git: 'Version control — track changes to your code',
  clone: 'Copy a repository to your machine',
  status: 'Check what files have changed',
  init: 'Initialize / set up',
  install: 'Download and install packages',
  touch: 'Create an empty file',
  echo: 'Print text (or write it to a file with >)',
  cat: 'Display contents of a file',
  rm: 'Remove/delete a file',
  python3: 'Run Python 3',
  node: 'Run a JavaScript file with Node.js',
  claude: 'Claude Code — AI coding assistant',
  '--version': 'Show the installed version',
  which: 'Find where a command is installed',
  code: 'Open Visual Studio Code',
  'xcode-select': 'Xcode developer tools manager',
  '--install': 'Run the installer',
  export: 'Set an environment variable',
  '--save-dev': 'Install as a development-only dependency',
  '-y': 'Auto-accept all prompts',
  '-g': 'Install globally (available everywhere)',
  '-la': 'List all files including hidden ones, with details',
}

function Token({ token }: { token: string }) {
  const hint = TOKEN_HINTS[token]
  if (!hint) return <span>{token}</span>
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-muted-foreground/50 cursor-help">{token}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[160px] text-center">
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function CommandPrompt({ command, send }: Props) {
  const [copied, setCopied] = useState(false)
  const [ghosted, setGhosted] = useState(false)
  const tokens = command.split(' ').filter(Boolean)

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
    <div className="space-y-2">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Run this command</p>
      <div className="flex items-center gap-2 bg-muted/60 border rounded-md px-3 py-2 font-mono text-sm group">
        <span className="text-muted-foreground select-none">$</span>
        <span className="flex-1 flex flex-wrap gap-x-1.5 text-foreground">
          {tokens.map((t, i) => <Token key={i} token={t} />)}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <button
        onClick={handleGhostType}
        disabled={ghosted}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
      >
        <Keyboard className="w-3 h-3" />
        {ghosted ? 'Typing into terminal…' : 'Type this for me'}
      </button>
    </div>
  )
}
