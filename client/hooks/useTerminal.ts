import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import type { ClientMessage, ServerMessage } from '../../shared/types'

interface UseTerminalOptions {
  send: (msg: ClientMessage) => void
  addListener: (fn: (msg: ServerMessage) => void) => () => void
}

export function useTerminal({ send, addListener }: UseTerminalOptions) {
  const termRef = useRef<HTMLDivElement | null>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const mountTerminal = useCallback((el: HTMLDivElement | null) => {
    if (!el || xtermRef.current) return
    termRef.current = el

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
    term.open(el)

    // Fit after a frame so dimensions are correct
    requestAnimationFrame(() => {
      fitAddon.fit()
      send({ type: 'terminal_resize', cols: term.cols, rows: term.rows })
    })

    // User types → send to server
    term.onData((data) => {
      send({ type: 'terminal_input', data })
    })

    // Resize observer
    const ro = new ResizeObserver(() => {
      fitAddon.fit()
      send({ type: 'terminal_resize', cols: term.cols, rows: term.rows })
    })
    ro.observe(el)

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Listen for terminal_output messages
    const unsub = addListener((msg) => {
      if (msg.type === 'terminal_output') {
        term.write(msg.data)
      }
    })

    // Cleanup
    return () => {
      unsub()
      ro.disconnect()
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [send, addListener])

  return { mountTerminal }
}
