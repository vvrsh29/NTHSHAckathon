import { useEffect, useRef, useState, useCallback } from 'react'
import type { ClientMessage, ServerMessage } from '../../shared/types'

export function useWebSocket(onMessage: (msg: ServerMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const listenersRef = useRef<Set<(msg: ServerMessage) => void>>(new Set())

  // Allow additional listeners (for hooks that need raw WS messages)
  const addListener = useCallback((fn: (msg: ServerMessage) => void) => {
    listenersRef.current.add(fn)
    return () => { listenersRef.current.delete(fn) }
  }, [])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.hostname
    // In dev, Vite proxies /ws to backend. In prod, same origin.
    const url = `${protocol}://${host}:${window.location.port}/ws`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected')
      setConnected(true)
    }

    ws.onmessage = (ev) => {
      try {
        const msg: ServerMessage = JSON.parse(ev.data)
        onMessage(msg)
        listenersRef.current.forEach((fn) => fn(msg))
        // Dispatch as window event for decoupled components
        window.dispatchEvent(new CustomEvent('ws-message', { detail: msg }))
      } catch (err) {
        console.error('[WS] Parse error:', err)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      setConnected(false)
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
    }

    return () => {
      ws.close()
    }
  }, [onMessage])

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  return { send, connected, addListener, ws: wsRef }
}
