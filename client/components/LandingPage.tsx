import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Terminal, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  onGetStarted: () => void
}

// ─── Fake terminal typing animation ──────────────────────────────────────────

const SEQUENCES: Array<{ command: string; response: string }> = [
  { command: 'mkdir my-app', response: '' },
  { command: 'cd my-app', response: '' },
  { command: 'claude "build me a todo app"', response: "I'll create a todo app for you..." },
  { command: 'open index.html', response: 'Opening in browser...' },
]

const TYPING_SPEED = 55   // ms per character
const PAUSE_AFTER  = 900  // ms after command before response
const BETWEEN_CMD  = 700  // ms between commands
const LOOP_PAUSE   = 2500 // ms before loop restart

type LineKind = 'prompt' | 'response'
interface Line { kind: LineKind; text: string }

function FakeTerminal() {
  const [lines, setLines] = useState<Line[]>([])
  const [typing, setTyping] = useState('')
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let cancelled = false

    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

    async function runLoop() {
      while (!cancelled) {
        setLines([])
        setTyping('')
        for (const { command, response } of SEQUENCES) {
          if (cancelled) return
          // type characters one by one
          for (let i = 0; i <= command.length; i++) {
            if (cancelled) return
            setTyping(command.slice(0, i))
            await sleep(TYPING_SPEED + Math.random() * 30)
          }
          await sleep(PAUSE_AFTER)
          if (cancelled) return
          // commit line
          setLines((prev) => [...prev, { kind: 'prompt', text: command }])
          setTyping('')
          if (response) {
            await sleep(120)
            setLines((prev) => [...prev, { kind: 'response', text: response }])
          }
          await sleep(BETWEEN_CMD)
        }
        await sleep(LOOP_PAUSE)
      }
    }

    runLoop()

    // blinking cursor
    const blink = setInterval(() => setCursor((c) => !c), 530)
    return () => { cancelled = true; clearInterval(blink) }
  }, [])

  const promptPrefix = '~/my-app $ '

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="flex-1 text-center text-xs text-zinc-500 font-mono select-none">
          terminal — my-app
        </span>
      </div>

      {/* Terminal body */}
      <div className="bg-zinc-950 font-mono text-sm px-5 py-4 min-h-[180px] space-y-1">
        {lines.map((line, i) => (
          <div key={i} className={line.kind === 'prompt' ? 'text-green-400' : 'text-zinc-500'}>
            {line.kind === 'prompt' ? (
              <><span className="text-zinc-600">{promptPrefix}</span>{line.text}</>
            ) : (
              line.text
            )}
          </div>
        ))}
        {/* Active typing row */}
        <div className="text-green-400">
          <span className="text-zinc-600">{promptPrefix}</span>
          {typing}
          <span className={cn('inline-block w-[7px] h-[14px] bg-green-400 ml-px align-middle', cursor ? 'opacity-100' : 'opacity-0')} />
        </div>
      </div>
    </div>
  )
}

// ─── Claude Code mockup ─────────────────────────────────────────────────────

function ClaudeCodeMockup() {
  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden shadow-2xl bg-zinc-950 text-sm font-mono">
      {/* browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="flex-1 mx-3 px-3 py-1 rounded bg-zinc-800 text-zinc-400 text-xs">Terminal</div>
      </div>
      <div className="p-5 space-y-2">
        <p className="text-zinc-500">~/my-app $</p>
        <p className="text-emerald-400">claude "add a dark mode toggle"</p>
        <p className="text-zinc-400 mt-3">I'll add a dark mode toggle to your app. Here's what I'm doing:</p>
        <p className="text-zinc-500 text-xs mt-2">  Creating styles/dark-mode.css</p>
        <p className="text-zinc-500 text-xs">  Updating index.html with toggle button</p>
        <p className="text-zinc-500 text-xs">  Adding JavaScript for theme switching</p>
        <p className="text-emerald-400/60 mt-3 text-xs">Done! 3 files modified.</p>
      </div>
    </div>
  )
}

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Terminal,
    title: 'Real Terminal',
    body: 'Not a simulation. A real shell on your machine. Every command you type is real.',
  },
  {
    icon: BookOpen,
    title: 'Guided Learning',
    body: 'Your AI mentor explains every step in plain English. Terminal, Git, Node.js, and Claude Code.',
  },
  {
    icon: Rocket,
    title: 'Build Real Projects',
    body: 'Use Claude Code to build actual apps. Not tutorials — real projects you understand.',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage({ onGetStarted }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className={cn(
        'sticky top-0 z-50 h-14 border-b transition-all duration-200',
        scrolled ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-background border-transparent',
      )}>
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-foreground">
              <Rocket className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">LaunchPad</span>
          </div>
          <Button size="sm" onClick={onGetStarted} className="gap-1.5">
            Open App <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Subtle gradient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-gradient-to-br from-zinc-800/30 to-zinc-900/0 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative max-w-5xl mx-auto text-center space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08]">
            Learn to code with<br />
            <span className="text-muted-foreground">Claude Code.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From zero to building real projects with AI — LaunchPad teaches you the terminal, sets up your tools, and walks you through your first Claude Code project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" onClick={onGetStarted} className="gap-2 px-6">
              Start Building <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="ghost" onClick={scrollToFeatures} className="text-muted-foreground hover:text-foreground">
              See how it works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Fake Terminal Demo ───────────────────────────────────────────── */}
      <section className="py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <FakeTerminal />

          {/* AI mentor card */}
          <div className="rounded-xl border bg-muted/40 px-5 py-4 flex gap-3 items-start">
            <div className="flex-none mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-foreground">
              <Rocket className="w-3 h-3 text-background" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Claude Code just built your todo app! Let's look at what it created and understand the code.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="bg-muted/40 border rounded-lg p-6 space-y-3"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-md bg-background border">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-12 text-center"
          >
            How it works
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                n: '01',
                title: 'Choose your level',
                body: 'Brand new? Start with terminal basics. Know the basics? Jump straight to Claude Code.',
              },
              {
                n: '02',
                title: 'Follow your mentor',
                body: 'Your AI mentor guides you through each step, explains commands, and helps when you get stuck.',
              },
              {
                n: '03',
                title: 'Build with Claude Code',
                body: 'Use Claude Code to build a real project. Your mentor explains what Claude Code is doing every step of the way.',
              },
            ].map(({ n, title, body }) => (
              <motion.div key={n} variants={itemVariants} className="space-y-3">
                <div className="text-6xl font-black text-muted-foreground/20 leading-none">{n}</div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── What you'll build ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">What you'll build</p>
              <h2 className="text-3xl font-bold mb-4">Build real projects with Claude Code.</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Tell Claude Code what you want. Watch it build. Your mentor explains every change. By the end, you've built something real — and you understand how.
              </p>
              <ul className="space-y-3">
                {[
                  'Tell Claude Code what to build in plain English',
                  'Watch as it creates files and writes code',
                  'Your mentor explains every change',
                  'Iterate: ask for changes, add features',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <ClaudeCodeMockup />
          </div>
        </div>
      </section>

      {/* ── Your journey ────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">The bigger picture</p>
          <h2 className="text-3xl font-bold mb-4">Your coding journey starts here.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
            LaunchPad takes you from zero to building real projects. Every step builds on the last — by the end, you'll have the skills to build anything.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { step: '01', title: 'Learn the basics', desc: 'Terminal, Git, environment setup. The foundation every developer needs.', active: true },
              { step: '02', title: 'Build with Claude Code', desc: 'Use Claude Code to build your first real project. Your mentor explains everything.', active: false },
              { step: '03', title: 'Go further', desc: 'Build apps, tools, startups. You have the skills.', active: false },
            ].map(({ step, title, desc, active }) => (
              <div key={step} className={`rounded-xl border p-6 ${active ? 'border-foreground bg-accent' : 'bg-muted/30'}`}>
                <p className="text-5xl font-black text-muted-foreground/20 mb-3">{step}</p>
                <p className="font-semibold mb-2">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                {active && <span className="mt-3 inline-block text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded-full">You are here</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-foreground text-background rounded-2xl p-12 text-center space-y-4">
            <h2 className="text-3xl font-black tracking-tight">Your first Claude Code project starts here.</h2>
            <p className="text-sm opacity-60 max-w-md mx-auto leading-relaxed">
              No experience needed. No install required. Just a terminal and curiosity.
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                variant="outline"
                onClick={onGetStarted}
                className="gap-2 border-background/20 bg-background text-foreground hover:bg-background/90 px-8"
              >
                Launch LaunchPad <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="px-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; 2026 LaunchPad &middot; Built at a hackathon with Claude Code
          </p>
        </div>
      </footer>

    </div>
  )
}
