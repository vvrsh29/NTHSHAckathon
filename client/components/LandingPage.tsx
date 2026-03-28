import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Terminal, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Props {
  onGetStarted: () => void
}

// ─── Fake terminal typing animation ──────────────────────────────────────────

const SEQUENCES: Array<{ command: string; response: string }> = [
  { command: 'mkdir my-portfolio', response: '' },
  { command: 'cd my-portfolio', response: '~/my-portfolio $' },
  { command: 'touch index.html style.css script.js', response: '' },
  { command: 'open index.html', response: 'Opening index.html in Chrome...' },
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

  const promptPrefix = '~/my-portfolio $ '

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="flex-1 text-center text-xs text-zinc-500 font-mono select-none">
          terminal — my-portfolio
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

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Terminal,
    title: 'Real Terminal',
    body: 'Not a simulation. A real shell running on your machine. Commands you type create real files.',
  },
  {
    icon: BookOpen,
    title: 'Guided Learning',
    body: 'Every command explained in plain English. Your AI mentor watches what you type and explains what just happened.',
  },
  {
    icon: Rocket,
    title: 'Graduate to Claude Code',
    body: 'Once you understand the basics, unlock the full power of AI-assisted coding with Claude Code.',
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
            Build your first website.<br />
            Learn every command.<br />
            <span className="text-muted-foreground">Graduate to Claude Code.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LaunchPad is an AI-powered coding tutor that lives in your terminal. Real commands, real files, real feedback — no hand-holding, just learning.
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
              Nice! You just created three files using <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">touch</code> — the foundation of any website. HTML is the structure, CSS is the style, JS is the behavior.
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
                title: 'SSH in',
                body: (
                  <>Open your terminal and run <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-xs">ssh localhost -p 2222</code>. That's your coding environment.</>
                ),
              },
              {
                n: '02',
                title: 'Follow the mentor',
                body: 'Your AI mentor guides you through each step, explains commands, and catches mistakes before they frustrate you.',
              },
              {
                n: '03',
                title: 'Ship something real',
                body: "By the end, you'll have a portfolio site you built yourself, understanding every line.",
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
            <h2 className="text-3xl font-black tracking-tight">Your first 100 commands start here.</h2>
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
            © 2026 LaunchPad · Built at a hackathon with Claude Code
          </p>
        </div>
      </footer>

    </div>
  )
}
