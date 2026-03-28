import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import { useMentor } from './hooks/useMentor'
import { useFileTree } from './hooks/useFileTree'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import MentorPanel from './components/MentorPanel'
import WelcomeScreen from './components/WelcomeScreen'
import StepIndicator from './components/StepIndicator'
import ModeSwitch from './components/ModeSwitch'
import FileTree from './components/FileTree'
import PreviewPane from './components/PreviewPane'
import { Wifi, WifiOff, Terminal } from 'lucide-react'
import type { ServerMessage, Phase, Step, GeneratedFile, FileTreeNode } from '../shared/types'

export default function App() {
  const [started, setStarted] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup')
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [commandSuggestion, setCommandSuggestion] = useState<{ command: string; explanation: string } | null>(null)
  const [generatedFiles, setGeneratedFiles] = useState<{ files: GeneratedFile[]; explanation: string } | null>(null)
  const [sshConnected, setSshConnected] = useState(false)
  const [projectName, setProjectName] = useState<string | undefined>()

  const { tree, newPaths, updateTree } = useFileTree(projectName)

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

  const handleStart = useCallback((description: string) => {
    send({ type: 'start_project', description })
    setStarted(true)
  }, [send])

  const handleResume = useCallback((name: string) => {
    setProjectName(name)
    send({ type: 'resume_project', projectName: name })
    setStarted(true)
  }, [send])

  useEffect(() => {
    document.body.classList.toggle('dashboard-active', started)
  }, [started])

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <WelcomeScreen onStart={handleStart} onResume={handleResume} connected={connected} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="h-screen flex flex-col bg-background"
        >
          {/* Top bar */}
          <header className="flex-none flex items-center justify-between h-11 px-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-tight text-foreground">LaunchPad</span>
              <Separator orientation="vertical" className="h-4" />

              {/* WS dot */}
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-400'}`} />

              {/* SSH status */}
              <span className={`flex items-center gap-1 text-xs ${sshConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {sshConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {sshConnected ? 'Terminal connected' : 'Awaiting SSH'}
              </span>

              {!sshConnected && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-xs text-muted-foreground font-mono">
                    ssh localhost -p 2222
                  </span>
                </>
              )}

              <ModeSwitch send={send} />
            </div>

            <StepIndicator currentPhase={currentPhase} stepIndex={stepIndex} />
          </header>

          {/* Main layout — resizable panels */}
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup orientation="horizontal" className="h-full">

              {/* Left: File Tree */}
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                <div className="h-full flex flex-col border-r">
                  <div className="flex items-center gap-2 h-9 px-3 border-b">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Files</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <FileTree nodes={tree} newPaths={newPaths} />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Center: SSH status / terminal info */}
              <ResizablePanel defaultSize={45} minSize={30}>
                <div className="h-full flex flex-col border-r">
                  <div className="flex items-center gap-2 h-9 px-3 border-b">
                    <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Terminal</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-8">
                    {sshConnected ? (
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950 mx-auto">
                          <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium">Terminal active</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Your SSH session is live. Type commands in your terminal window — the mentor is watching.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 max-w-sm">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted mx-auto">
                          <Terminal className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Connect your terminal</p>
                          <p className="text-xs text-muted-foreground">
                            Open a terminal and run:
                          </p>
                        </div>
                        <code className="block text-sm font-mono bg-muted px-4 py-2.5 rounded-md border text-foreground">
                          ssh localhost -p 2222
                        </code>
                        <p className="text-xs text-muted-foreground">
                          Keep that window open. Your mentor guides you from the right panel.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Right: Mentor + Preview tabs */}
              <ResizablePanel defaultSize={40} minSize={28}>
                <Tabs defaultValue="mentor" className="h-full flex flex-col">
                  <div className="flex items-center h-9 border-b px-1">
                    <TabsList className="h-7 bg-transparent gap-0 p-0">
                      <TabsTrigger
                        value="mentor"
                        className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        Mentor
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="h-7 px-3 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="mentor" className="flex-1 min-h-0 mt-0 overflow-hidden">
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
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 min-h-0 mt-0 overflow-hidden">
                    <PreviewPane projectName={projectName} />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>

            </ResizablePanelGroup>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
