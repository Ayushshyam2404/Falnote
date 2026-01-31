import { useEffect, useRef, useCallback } from 'react'
import { WS_BASE_URL } from './types'

export function useWebSocket(sessionId: string, onMessage: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3

  const connect = useCallback(() => {
    try {
      const wsUrl = `${WS_BASE_URL}/ws/${sessionId}`
      console.log('[WebSocket] Attempting to connect to:', wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('[WebSocket] Connected successfully')
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e)
        }
      }

      wsRef.current.onerror = (error) => {
        console.warn('[WebSocket] Connection error:', error)
        // Don't throw - WebSocket errors are non-critical for app functionality
      }

      wsRef.current.onclose = () => {
        console.log('[WebSocket] Disconnected')
        // Attempt reconnection only on first few attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = 2000 * reconnectAttempts.current
          console.log(`[WebSocket] Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          setTimeout(connect, delay)
        } else {
          console.log('[WebSocket] Max reconnection attempts reached. Real-time sync unavailable.')
        }
      }
    } catch (e) {
      console.error('[WebSocket] Failed to connect:', e)
    }
  }, [sessionId, onMessage])

  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send, connected: wsRef.current?.readyState === WebSocket.OPEN }
}
