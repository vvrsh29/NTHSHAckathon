import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import type { ClientMessage, ServerMessage } from '../../shared/types'

interface Props {
  send: (msg: ClientMessage) => void
  addListener: (fn: (msg: ServerMessage) => void) => () => void
}

export default function XTerminal({ send, addListener }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      theme: {
        background: '#09090b',   // zinc-950
        foreground: '#fafafa',   // zinc-50
        cursor: '#fafafa',
        cursorAccent: '#09090b',
        selectionBackground: '#3f3f46',  // zinc-700
        black: '#09090b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#fafafa',
      },
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(containerRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current = fit

    // Send keystrokes to server
    const dataDispose = term.onData((data) => {
      send({ type: 'pty_input', data })
    })

    // Send resize events
    const resizeDispose = term.onResize(({ cols, rows }) => {
      send({ type: 'pty_resize', cols, rows })
    })

    // Listen for PTY output from server
    const removeListener = addListener((msg: ServerMessage) => {
      if (msg.type === 'pty_output') {
        term.write(msg.data)
      }
    })

    // Fit on container resize
    const observer = new ResizeObserver(() => {
      try { fit.fit() } catch {}
    })
    observer.observe(containerRef.current)

    // Send initial size
    send({ type: 'pty_resize', cols: term.cols, rows: term.rows })

    return () => {
      dataDispose.dispose()
      resizeDispose.dispose()
      removeListener()
      observer.disconnect()
      term.dispose()
    }
  }, [send, addListener])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#09090b]"
      style={{ padding: '8px 0 0 8px' }}
    />
  )
}
