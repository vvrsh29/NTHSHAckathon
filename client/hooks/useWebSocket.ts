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
    const url = `${protocol}://${host}:${window.location.port}/ws`

    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let destroyed = false

    function connect() {
      if (destroyed) return
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
          window.dispatchEvent(new CustomEvent('ws-message', { detail: msg }))
        } catch (err) {
          console.error('[WS] Parse error:', err)
        }
      }

      ws.onclose = () => {
        console.log('[WS] Disconnected — retrying in 2s')
        setConnected(false)
        if (!destroyed) {
          retryTimer = setTimeout(connect, 2000)
        }
      }

      ws.onerror = () => {
        // onclose fires after onerror, retry handled there
      }
    }

    connect()

    return () => {
      destroyed = true
      if (retryTimer) clearTimeout(retryTimer)
      wsRef.current?.close()
    }
  }, [])

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  return { send, connected, addListener, ws: wsRef }
}
