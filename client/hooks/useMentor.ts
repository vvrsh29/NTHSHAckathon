import { useState, useEffect, useCallback } from 'react'
import type { ServerMessage, MentorMessageType } from '../../shared/types'

export interface MentorMessage {
  id: string
  messageType: MentorMessageType
  content: string
  streaming: boolean
  timestamp: number
}

export function useMentor(addListener: (fn: (msg: ServerMessage) => void) => () => void) {
  const [messages, setMessages] = useState<MentorMessage[]>([])

  useEffect(() => {
    const unsub = addListener((msg) => {
      if (msg.type === 'mentor_message') {
        setMessages((prev) => {
          // If streaming, update the last message of same type
          if (msg.streaming) {
            const lastIdx = prev.findLastIndex(
              (m) => m.messageType === msg.messageType && m.streaming
            )
            if (lastIdx >= 0) {
              const updated = [...prev]
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + msg.content,
              }
              return updated
            }
          }
          // New message
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              messageType: msg.messageType,
              content: msg.content,
              streaming: msg.streaming ?? false,
              timestamp: Date.now(),
            },
          ]
        })
      }
    })
    return unsub
  }, [addListener])

  const clearMessages = useCallback(() => setMessages([]), [])

  return { messages, clearMessages }
}
