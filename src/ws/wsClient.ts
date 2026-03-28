import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAccessToken } from '../lib/supabase'

let stompClient: Client | null = null
const subscriptions = new Map<string, StompSubscription>()

export const connectWs = async (onConnected?: () => void) => {
  const token = await getAccessToken()
  if (!token) return

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(`${import.meta.env.VITE_API_URL}/ws`) as WebSocket,

    connectHeaders: { Authorization: `Bearer ${token}` },

    reconnectDelay: 3000,

    onConnect: () => {
      console.log('[WS] Connected')
      onConnected?.()
    },

    onDisconnect: () => {
      console.log('[WS] Disconnected')
    },

    onStompError: (frame) => {
      console.error('[WS] STOMP error:', frame)
    },
  })

  stompClient.activate()
}

export const disconnectWs = () => {
  subscriptions.forEach((sub) => sub.unsubscribe())
  subscriptions.clear()
  stompClient?.deactivate()
  stompClient = null
}

export const subscribeToTopic = (
  topic: string,
  callback: (data: unknown) => void
): (() => void) => {
  if (!stompClient?.connected) {
    console.warn('[WS] Not connected, cannot subscribe to', topic)
    return () => {}
  }

  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const data = JSON.parse(message.body)
      callback(data)
    } catch {
      callback(message.body)
    }
  })

  subscriptions.set(topic, sub)

  return () => {
    sub.unsubscribe()
    subscriptions.delete(topic)
  }
}

export const sendWsMessage = (destination: string, body: object) => {
  if (!stompClient?.connected) return
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  })
}

export const isWsConnected = () => stompClient?.connected ?? false