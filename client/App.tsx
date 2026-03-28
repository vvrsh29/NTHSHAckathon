import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import { useMentor } from './hooks/useMentor'
import { useFileTree } from './hooks/useFileTree'
import MentorPanel from './components/MentorPanel'
import WelcomeScreen from './components/WelcomeScreen'
import StepIndicator from './components/StepIndicator'
import ModeSwitch from './components/ModeSwitch'
import FileTree from './components/FileTree'
import PreviewPane from './components/PreviewPane'
import { Terminal, Eye, FolderOpen, Wifi, WifiOff } from 'lucide-react'
import type { ServerMessage, Phase, Step, GeneratedFile, FileTreeNode } from '../shared/types'

type RightTab = 'mentor' | 'preview'

export default function App() {
  const [started, setStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup')
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [commandSuggestion, setCommandSuggestion] = useState<{ command: string; explanation: string } | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<{ files: GeneratedFile[]; explanation: string } | null>(null)
  const [sshConnected, setSshConnected] = useState(false)
  const [rightTab, setRightTab] = useState<RightTab>('mentor')
  const [projectName, setProjectName] = useState<string | undefined>()

  const { tree, newPaths, updateTree } = useFileTree(projectName)

  useEffect(() => {
    document.body.classList.toggle('dashboard-active', started)
  }, [started])

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'step_update':
        setCurrentPhase(msg.phase)
        setStepIndex(msg.stepIndex)
        setCurrentStep(msg.step)
        break
      case 'command_suggestion':
        setCommandSuggestion({ command: msg.command, explanation: msg.explanation })
        break
      case 'code_generated':
        setGeneratedFiles({ files: msg.files, explanation: msg.explanation })
        break
      case 'ssh_status':
        setSshConnected(msg.connected)
        break
      case 'file_tree':
        updateTree(msg.tree)
        break
      case 'plan_parsed':
        setProjectName(msg.plan.name)
        break
    }
  }, [updateTree])

  const { send, connected, addListener } = useWebSocket(handleMessage)
  const { messages: mentorMessages, isThinking, startThinking } = useMentor(addListener)

  const handleStart = useCallback((description: string, apiKey?: string) => {
    send({ type: 'start_project', description, apiKey })
    setStarted(true)
  }, [send])

  const handleResume = useCallback((name: string) => {
    setProjectName(name)
    send({ type: 'resume_project', projectName: name })
    setStarted(true)
  }, [send])

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen onStart={handleStart} onResume={handleResume} connected={connected} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen flex flex-col bg-surface-0 overflow-hidden"
        >
          {/* Top bar */}
          <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-white/10 bg-surface-1 z-10">
            <div className="flex items-center gap-3">
              <span className="text-brand-400 font-bold text-lg tracking-tight">LaunchPad</span>

              {/* WS status */}
              {connected ? (
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="WebSocket connected" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs text-yellow-400">Reconnecting...</span>
                </span>
              )}

              {/* SSH status pill */}
              <span
                className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  sshConnected
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-gray-700 bg-transparent text-gray-500'
                }`}
              >
                {sshConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                SSH {sshConnected ? 'connected' : 'waiting'}
              </span>

              {!sshConnected && (
                <span className="text-xs text-gray-500 hidden sm:block">
                  Run: <code className="bg-surface-2 px-1.5 py-0.5 rounded font-mono">ssh localhost -p 2222</code>
                </span>
              )}

              <ModeSwitch send={send} />
            </div>

            <StepIndicator currentPhase={currentPhase} stepIndex={stepIndex} />
          </div>

          {/* Main layout */}
          <div className="flex-1 flex min-h-0">
            {/* Left sidebar — file tree */}
            <div className="w-52 flex-none border-r border-white/10 flex flex-col bg-surface-1/50 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Files</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <FileTree nodes={tree} newPaths={newPaths} />
              </div>
            </div>

            {/* Center — SSH terminal instructions / status */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-surface-1">
                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Terminal</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                {sshConnected ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-2">
                      <Terminal className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-emerald-300 font-semibold">Terminal connected!</p>
                    <p className="text-gray-400 text-sm max-w-xs">
                      Your SSH terminal session is active. Type commands there — your mentor is watching.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 max-w-sm"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 mb-2">
                      <Terminal className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Connect your terminal</p>
                      <p className="text-gray-400 text-sm">
                        Open a terminal on your computer and run:
                      </p>
                    </div>
                    <motion.code
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(167,139,250,0)',
                          '0 0 20px rgba(167,139,250,0.15)',
                          '0 0 0px rgba(167,139,250,0)',
                        ],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="block bg-black/50 text-purple-200 px-6 py-3 rounded-xl font-mono text-base border border-purple-500/20"
                    >
                      ssh localhost -p 2222
                    </motion.code>
                    <p className="text-gray-500 text-xs">
                      Your AI mentor will guide you from the panel on the right.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right panel — tabs: Mentor / Preview */}
            <div className="w-96 flex-none flex flex-col min-w-0">
              <div className="flex items-center border-b border-white/10 bg-surface-1">
                <button
                  onClick={() => setRightTab('mentor')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wide transition border-b-2 ${
                    rightTab === 'mentor'
                      ? 'text-brand-300 border-brand-500'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  AI Mentor
                </button>
                <button
                  onClick={() => setRightTab('preview')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wide transition border-b-2 ${
                    rightTab === 'preview'
                      ? 'text-brand-300 border-brand-500'
                      : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                {rightTab === 'mentor' ? (
                  <MentorPanel
                    send={send}
                    addListener={addListener}
                    currentStep={currentStep}
                    commandSuggestion={commandSuggestion}
                    generatedFiles={generatedFiles}
                    messages={mentorMessages}
                    isThinking={isThinking}
                    onStartThinking={startThinking}
                  />
                ) : (
                  <PreviewPane projectName={projectName} />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
