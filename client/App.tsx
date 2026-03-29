import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import { useMentor } from './hooks/useMentor'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import MentorPanel from './components/MentorPanel'
import LandingPage from './components/LandingPage'
import LoginScreen from './components/LoginScreen'
import Onboarding from './components/Onboarding'
import HomeScreen from './components/HomeScreen'
import CompletionScreen from './components/CompletionScreen'
import InterfaceGuide from './components/InterfaceGuide'
import StepIndicator from './components/StepIndicator'
import ModeSwitch from './components/ModeSwitch'
import XTerminal from './components/XTerminal'
import { Rocket, TerminalSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServerMessage, CourseLevel, PhaseDefinition, Step, EnvDetectionResult } from '../shared/types'

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()

  const [courseLevel, setCourseLevel] = useState<CourseLevel | null>(null)
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem('launchpad-user-name') || '' } catch { return '' }
  })
  const [userRole, setUserRole] = useState('')
  const [envResults, setEnvResults] = useState<EnvDetectionResult | null>(null)
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('launchpad-anthropic-key') || '' } catch { return '' }
  })
  const [buildIdea, setBuildIdea] = useState('')
  const [courseTopic, setCourseTopic] = useState('')
  const [projectDir, setProjectDir] = useState('~/launchpad-projects')
  const [coursePhases, setCoursePhases] = useState<PhaseDefinition[]>([])
  const [currentStep, setCurrentStep] = useState<Step | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [stepIndex, setStepIndex] = useState(0)
  const [commandSuggestion, setCommandSuggestion] = useState<{ command: string; explanation: string } | null>(null)
  const [sshConnected, setSshConnected] = useState(false)
  const [ptyReady, setPtyReady] = useState(false)

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'course_started':
        setCoursePhases(msg.phases)
        setCourseLevel(msg.level)
        break
      case 'step_update':
        setCurrentStep(msg.step)
        setCurrentPhase(msg.phase)
        setStepIndex(msg.stepIndex)
        break
      case 'command_suggestion':
        setCommandSuggestion({ command: msg.command, explanation: msg.explanation })
        break
      case 'ssh_status':
        setSshConnected(msg.connected)
        break
      case 'pty_ready':
        setPtyReady(true)
        break
      case 'env_detection':
        setEnvResults(msg.results)
        break
      case 'course_complete':
        navigate('/complete')
        break
      // phase_complete handled by MentorPanel / listeners
    }
  }, [navigate])

  const { send, connected, addListener } = useWebSocket(handleMessage)
  const { messages, isThinking, startThinking } = useMentor(addListener)

  const handleOnboardingComplete = useCallback((config: { level: CourseLevel; apiKey: string; buildIdea: string; userName: string; userRole: string; projectDir: string; courseTopic: string }) => {
    setCourseLevel(config.level)
    setUserName(config.userName)
    setUserRole(config.userRole)
    setBuildIdea(config.buildIdea)
    setCourseTopic(config.courseTopic)
    setProjectDir(config.projectDir)
    if (config.apiKey) {
      setApiKey(config.apiKey)
      try { localStorage.setItem('launchpad-anthropic-key', config.apiKey) } catch {}
      send({ type: 'set_api_key', apiKey: config.apiKey })
    }
    // Store config for when user clicks "Continue" on home screen
    navigate('/home')
  }, [send, navigate])

  const handleContinueLearning = useCallback(() => {
    send({ type: 'select_course', level: courseLevel!, apiKey, buildIdea, userName, userRole, projectDir, courseTopic })
    navigate('/course')
  }, [send, courseLevel, apiKey, buildIdea, userName, userRole, projectDir, courseTopic, navigate])

  // Auto-redirect on mount if user is already logged in
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('launchpad-user-name')
      const savedEmail = localStorage.getItem('launchpad-user-email')
      if (savedName && savedEmail && location.pathname === '/') {
        navigate('/onboarding', { replace: true })
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dashboard-active', location.pathname === '/course')
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LandingPage onGetStarted={() => navigate('/login')} />
          </motion.div>
        } />

        <Route path="/login" element={
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LoginScreen onSignIn={(name) => {
              setUserName(name)
              navigate('/onboarding')
            }} />
          </motion.div>
        } />

        <Route path="/onboarding" element={
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Onboarding onComplete={handleOnboardingComplete} onBack={() => navigate('/login')} />
          </motion.div>
        } />

        <Route path="/home" element={
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen
              userName={userName}
              courseLevel={courseLevel}
              coursePhases={coursePhases}
              currentPhase={currentPhase}
              stepIndex={stepIndex}
              envResults={envResults}
              onContinue={handleContinueLearning}
              onChangeCourse={() => navigate('/onboarding')}
            />
          </motion.div>
        } />

        <Route path="/course" element={
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="h-screen"
          >
            <div className="h-screen flex flex-col bg-background text-foreground">
              {/* Header */}
              <header className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/home')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground">
                      <Rocket className="w-3.5 h-3.5 text-background" />
                    </div>
                    <span className="text-base font-semibold">LaunchPad</span>
                  </button>
                  {/* WS status dot */}
                  <div className={cn('w-1.5 h-1.5 rounded-full', connected ? 'bg-emerald-500' : 'bg-amber-500')} />
                  {/* PTY/SSH status */}
                  <span className="text-[10px] text-muted-foreground">
                    {ptyReady ? 'Terminal ready' : sshConnected ? 'SSH connected' : 'Starting terminal...'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                          navigator.clipboard.writeText('ssh localhost -p 2222')
                        }}>
                          <TerminalSquare className="w-3 h-3" />
                          SSH
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>ssh localhost -p 2222 (copied!)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ModeSwitch send={send} />
                  <StepIndicator
                    phases={coursePhases.map(p => ({ id: p.id, label: p.title || p.id }))}
                    currentPhase={currentPhase}
                    stepIndex={stepIndex}
                  />
                </div>
              </header>

              {/* Interface guide overlay */}
              <InterfaceGuide />

              {/* Two panels */}
              <div className="flex-1 min-h-0">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={55} minSize={35}>
                    <div className="h-full flex flex-col">
                      <div className="h-8 border-b flex items-center px-3 gap-2">
                        <TerminalSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Terminal</span>
                      </div>
                      <div className="flex-1 min-h-0">
                        <XTerminal send={send} addListener={addListener} />
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />

                  <ResizablePanel defaultSize={45} minSize={28}>
                    <MentorPanel
                      send={send}
                      addListener={addListener}
                      currentStep={currentStep}
                      commandSuggestion={commandSuggestion}
                      messages={messages}
                      isThinking={isThinking}
                      onStartThinking={startThinking}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </motion.div>
        } />

        <Route path="/complete" element={
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompletionScreen
              userName={userName}
              onGoHome={() => navigate('/home')}
            />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
