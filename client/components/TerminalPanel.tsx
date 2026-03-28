import { useEffect, useRef } from 'react'
import '@xterm/xterm/css/xterm.css'
import { useWebSocket } from '../hooks/useWebSocket'
import { useTerminal } from '../hooks/useTerminal'
import type { ClientMessage, ServerMessage } from '../../shared/types'

interface Props {
  send: (msg: ClientMessage) => void
}

export default function TerminalPanel({ send }: Props) {
  // We need addListener from useWebSocket — but it's in App.
  // Instead, we'll create the terminal inline to avoid double-socket.
  // The useTerminal hook needs addListener, so we pass it through.
  // For now, we wire it up directly.

  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<any>(null)
  const fitAddonRef = useRef<any>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!containerRef.current || termRef.current) return

    // Dynamic import to avoid SSR issues
    let cancelled = false

    async function init() {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      await import('@xterm/xterm/css/xterm.css')

      if (cancelled || !containerRef.current) return

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        theme: {
          background: '#0d0d0d',
          foreground: '#e4e4e7',
          cursor: '#818cf8',
          selectionBackground: '#6366f140',
        },
        allowProposedApi: true,
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(containerRef.current)

      requestAnimationFrame(() => {
        fitAddon.fit()
        send({ type: 'terminal_resize', cols: term.cols, rows: term.rows })
      })

      // User types → send to server
      term.onData((data: string) => {
        send({ type: 'terminal_input', data })
      })

      // Resize
      const ro = new ResizeObserver(() => {
        fitAddon.fit()
        send({ type: 'terminal_resize', cols: term.cols, rows: term.rows })
      })
      ro.observe(containerRef.current!)

      termRef.current = term
      fitAddonRef.current = fitAddon

      // Expose the terminal write on the container for parent to call
      ;(containerRef.current as any).__xterm = term

      cleanupRef.current = () => {
        ro.disconnect()
        term.dispose()
      }
    }

    init()

    return () => {
      cancelled = true
      cleanupRef.current?.()
      termRef.current = null
    }
  }, [send])

  // Listen for WS messages to write to terminal
  // We'll use a global event approach via window
  useEffect(() => {
    function handler(e: CustomEvent<ServerMessage>) {
      if (e.detail.type === 'terminal_output' && termRef.current) {
        termRef.current.write(e.detail.data)
      }
    }
    window.addEventListener('ws-message', handler as any)
    return () => window.removeEventListener('ws-message', handler as any)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0d0d0d]"
    />
  )
}
