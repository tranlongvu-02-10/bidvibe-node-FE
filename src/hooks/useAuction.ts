import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '../api/auctionApi'
import { subscribeToTopic } from '../ws/wsClient'
import { useCountdown } from './useCountdown'
import type {
  Auction, Message,
  AuctionUpdatePayload, TimerTickPayload,
  AuctionEndedPayload, ChatMessagePayload,
  DutchPriceDropPayload, SealedRevealPayload,
} from '../types'

export const useAuction = (auctionId: string) => {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [isEnded, setIsEnded] = useState(false)
  const [sealedBids, setSealedBids] = useState<{ nickname: string; amount: number }[]>([])
  const [endTime, setEndTime] = useState<string | null>(null)

  // Load auction data
  const { data: auction, isLoading } = useQuery<Auction>({
    queryKey: ['auction', auctionId],
    queryFn: () => auctionApi.getAuction(auctionId),
  })

  // Load initial messages
  const { data: messagesData } = useQuery({
    queryKey: ['auction-messages', auctionId],
    queryFn: () => auctionApi.getMessages(auctionId),
  })

  // Load bids
  const { data: bidsData, refetch: refetchBids } = useQuery({
    queryKey: ['auction-bids', auctionId],
    queryFn: () => auctionApi.getBids(auctionId),
  })

  const effectiveEndTime = endTime ?? auction?.endTime ?? null
  const { remaining, syncFromServer } = useCountdown(effectiveEndTime)

  const effectiveIsEnded =
    isEnded || auction?.status === 'ENDED' || auction?.status === 'CANCELLED'

  const effectiveMessages =
    messages.length > 0 ? messages : (messagesData?.content ?? [])

  useEffect(() => {
    const topic = `/topic/auction/${auctionId}`

    const unsubscribe = subscribeToTopic(topic, (data: unknown) => {
      const payload = data as Record<string, unknown>
      const event = payload.event as string

      if (event === 'auction_update' || payload.currentPrice !== undefined) {
        const update = payload as unknown as AuctionUpdatePayload
        queryClient.setQueryData(['auction', auctionId], (old: Auction | undefined) => {
          if (!old) return old
          return {
            ...old,
            currentPrice: update.currentPrice,
            winnerId: update.winnerId,
            winnerNickname: update.winnerNickname,
            endTime: update.endTime,
          }
        })
        setEndTime(update.endTime)
        refetchBids()
      }

      if (event === 'timer_tick' || payload.remainingSeconds !== undefined) {
        const tick = payload as unknown as TimerTickPayload
        syncFromServer(tick.remainingSeconds)
        setEndTime(tick.endTime)
      }

      if (event === 'dutch_price_drop' || payload.previousPrice !== undefined) {
        const drop = payload as unknown as DutchPriceDropPayload
        queryClient.setQueryData(['auction', auctionId], (old: Auction | undefined) => {
          if (!old) return old
          return { ...old, currentPrice: drop.currentPrice }
        })
      }

      if (event === 'auction_ended' || payload.finalPrice !== undefined) {
        const ended = payload as unknown as AuctionEndedPayload
        setIsEnded(true)
        queryClient.setQueryData(['auction', auctionId], (old: Auction | undefined) => {
          if (!old) return old
          return {
            ...old,
            status: 'ENDED',
            winnerId: ended.winnerId,
            currentPrice: ended.finalPrice,
          }
        })
        refetchBids()
      }

      if (event === 'sealed_reveal' || payload.allBids !== undefined) {
        const reveal = payload as unknown as SealedRevealPayload
        setSealedBids(reveal.allBids)
        setIsEnded(true)
        queryClient.setQueryData(['auction', auctionId], (old: Auction | undefined) => {
          if (!old) return old
          return {
            ...old,
            status: 'ENDED',
            winnerId: reveal.winnerId,
            winnerNickname: reveal.winnerNickname,
          }
        })
      }

      if (event === 'chat_message' || payload.nickname !== undefined) {
        const msg = payload as unknown as ChatMessagePayload
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            senderId: msg.senderId,
            senderNickname: msg.nickname,
            senderAvatar: msg.avatarUrl,
            content: msg.content,
            createdAt: msg.createdAt,
          },
        ])
      }
    })

    return unsubscribe
  }, [auctionId, queryClient, syncFromServer, refetchBids])

  return {
    auction,
    isLoading,
    remaining,
    isEnded: effectiveIsEnded,
    bids: bidsData?.content ?? [],
    messages: effectiveMessages,
    sealedBids,
    refetchBids,
  }
}