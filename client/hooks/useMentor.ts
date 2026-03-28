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
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    const unsub = addListener((msg) => {
      if (msg.type === 'mentor_message') {
        // A non-streaming mentor_message means thinking is done
        if (!msg.streaming) {
          setIsThinking(false)
        }

        setMessages((prev) => {
          // If streaming, update the last message of same type
          if (msg.streaming) {
            let lastIdx = -1
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].messageType === msg.messageType && prev[i].streaming) {
                lastIdx = i
                break
              }
            }
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

  const startThinking = useCallback(() => setIsThinking(true), [])

  return { messages, clearMessages, isThinking, startThinking }
}
