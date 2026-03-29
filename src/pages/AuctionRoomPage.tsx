import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Trophy, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { auctionApi } from '../api/auctionApi'
import { useAuction } from '../hooks/useAuction'
import { useAuthStore } from '../store/authStore'
import { connectWs, subscribeToTopic } from '../ws/wsClient'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { formatVND, formatCountdown } from '../utils/format'

// ── Bid History Panel ──────────────────────────────────────
const BidHistory = ({ bids }: { bids: ReturnType<typeof useAuction>['bids'] }) => (
  <div className="space-y-2 max-h-64 overflow-y-auto">
    {!bids.length ? (
      <p className="text-sm text-gray-400 text-center py-4">Chưa có lượt đặt giá nào</p>
    ) : (
      bids.map((bid, i) => (
        <div key={bid.id} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <div className="flex items-center gap-2">
            {i === 0 && <Trophy size={13} className="text-purple-600" />}
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600">
              {bid.nickname?.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {bid.nickname}
            </span>
            {bid.isProxy && (
              <Badge variant="gray">Auto</Badge>
            )}
          </div>
          <span className={`text-sm font-medium ${i === 0 ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300'}`}>
            {formatVND(bid.amount)}
          </span>
        </div>
      ))
    )}
  </div>
)

// ── Chat Panel ─────────────────────────────────────────────
const ChatPanel = ({
  messages,
  auctionId,
  userId,
}: {
  messages: ReturnType<typeof useAuction>['messages']
  auctionId: string
  userId: string
}) => {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const content = input.trim()
    if (!content) return
    auctionApi.sendMessage(auctionId, content).catch(() => {})
    setInput('')
  }

  return (
    <div className="flex flex-col h-72">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {!messages.length ? (
          <p className="text-xs text-gray-400 text-center py-4">Chưa có tin nhắn nào</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.senderId === userId ? 'flex-row-reverse' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                {msg.senderNickname?.slice(0, 1).toUpperCase()}
              </div>
              <div className={`max-w-[70%] ${msg.senderId === userId ? 'items-end' : 'items-start'} flex flex-col`}>
                {msg.senderId !== userId && (
                  <span className="text-xs text-gray-400 mb-0.5">{msg.senderNickname}</span>
                )}
                <div className={`px-3 py-1.5 rounded-xl text-sm ${
                  msg.senderId === userId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={send}
          className="w-9 h-9 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main AuctionRoomPage ───────────────────────────────────
export const AuctionRoomPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [bidAmount, setBidAmount]   = useState('')
  const [maxAmount, setMaxAmount]   = useState('')
  const [showProxy, setShowProxy]   = useState(false)
  const [activeTab, setActiveTab]   = useState<'bids' | 'chat'>('bids')
  const queryClient = useQueryClient()

  const { auction, isLoading, remaining, isEnded, bids, messages, sealedBids } = useAuction(id!)

  // Connect WS khi vào phòng
  useEffect(() => {
    connectWs(() => {
      // Join auction room
      subscribeToTopic(`/topic/auction/${id}`, () => {})
    })
  }, [id])

  // Bid mutation
  const bidMutation = useMutation({
    mutationFn: () => auctionApi.placeBid(id!, parseFloat(bidAmount)),
    onSuccess: () => {
      toast.success('Đặt giá thành công!')
      setBidAmount('')
      queryClient.invalidateQueries({ queryKey: ['auction-bids', id] })
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Đặt giá thất bại'
      toast.error(msg)
    },
  })

  // Proxy bid mutation
  const proxyMutation = useMutation({
    mutationFn: () => auctionApi.setProxyBid(id!, parseFloat(maxAmount)),
    onSuccess: () => {
      toast.success('Đã cài Proxy Bid!')
      setMaxAmount('')
      setShowProxy(false)
    },
    onError: () => toast.error('Cài Proxy Bid thất bại'),
  })

  // Dutch buy mutation
  const dutchMutation = useMutation({
    mutationFn: () => auctionApi.buyDutch(id!),
    onSuccess: () => toast.success('Mua thành công!'),
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Mua thất bại'
      toast.error(msg)
    },
  })

  // Sealed bid mutation
  const sealedMutation = useMutation({
    mutationFn: () => auctionApi.placeSealedBid(id!, parseFloat(bidAmount)),
    onSuccess: () => {
      toast.success('Đã gửi giá kín!')
      setBidAmount('')
    },
    onError: () => toast.error('Gửi giá kín thất bại'),
  })

  if (isLoading) return <PageSpinner />
  if (!auction) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
      Auction không tồn tại
    </div>
  )

  const isActive  = auction.status === 'ACTIVE'
  const isEnglish = auction.sessionType === 'ENGLISH'
  const isDutch   = auction.sessionType === 'DUTCH'
  const isSealed  = auction.sessionType === 'SEALED'
  const minBid    = parseFloat(String(auction.currentPrice)) + parseFloat(String(auction.stepPrice || 0))
  const isUrgent  = remaining > 0 && remaining <= 10

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        to={`/sessions/${auction.sessionId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={14} />
        Quay lại phiên
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Item image */}
        <div className="lg:col-span-1">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {auction.itemImages?.[0] ? (
              <img
                src={auction.itemImages[0]}
                alt={auction.itemName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Tags */}
          {auction.itemTags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {auction.itemTags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {auction.itemDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              {auction.itemDescription}
            </p>
          )}
        </div>

        {/* Center — Bid panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Item name + status */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={
                auction.itemRarity === 'LEGENDARY' ? 'amber' :
                auction.itemRarity === 'RARE' ? 'purple' : 'gray'
              }>
                {auction.itemRarity === 'LEGENDARY' ? 'Huyền thoại' :
                 auction.itemRarity === 'RARE' ? 'Hiếm' : 'Phổ thông'}
              </Badge>
              {isActive && (
                <Badge variant="green">Đang đấu giá</Badge>
              )}
              {isEnded && (
                <Badge variant="gray">Đã kết thúc</Badge>
              )}
            </div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white">
              {auction.itemName}
            </h1>
          </div>

          {/* Current price */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">
              {isDutch ? 'Giá hiện tại (đang giảm)' : 'Giá cao nhất'}
            </p>
            <p className="text-3xl font-medium text-purple-600 dark:text-purple-400">
              {formatVND(auction.currentPrice)}
            </p>
            {auction.winnerNickname && (
              <p className="text-sm text-gray-400 mt-1">
                bởi <span className="font-medium text-gray-700 dark:text-gray-300">{auction.winnerNickname}</span>
              </p>
            )}
          </div>

          {/* Countdown */}
          {isActive && !isDutch && (
            <div className={`flex items-center gap-2 p-4 rounded-2xl border ${
              isUrgent
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
            }`}>
              <Clock size={16} className={isUrgent ? 'text-red-500' : 'text-gray-400'} />
              <span className={`text-2xl font-medium tabular-nums ${isUrgent ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {formatCountdown(remaining)}
              </span>
              {isUrgent && (
                <span className="text-xs text-red-400 ml-1">Sắp kết thúc!</span>
              )}
            </div>
          )}

          {/* Winner announcement */}
          {isEnded && auction.winnerId && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
              <Trophy size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {auction.winnerNickname} đã thắng!
                </p>
                <p className="text-xs text-green-600">
                  {formatVND(auction.currentPrice)}
                </p>
              </div>
            </div>
          )}

          {/* English bid form */}
          {isActive && isEnglish && user && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Giá đặt (tối thiểu {formatVND(minBid)})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={String(minBid)}
                    className="flex-1 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => bidMutation.mutate()}
                    disabled={!bidAmount || bidMutation.isPending}
                    className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {bidMutation.isPending ? 'Đang đặt...' : 'Đặt giá'}
                  </button>
                </div>
              </div>

              {/* Quick bid buttons */}
              <div className="flex gap-2">
                {[1, 2, 5].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setBidAmount(String(minBid + (auction.stepPrice || 0) * (mult - 1)))}
                    className="flex-1 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"
                  >
                    +{formatVND((auction.stepPrice || 0) * mult)}
                  </button>
                ))}
              </div>

              {/* Proxy bid */}
              <button
                onClick={() => setShowProxy(!showProxy)}
                className="w-full text-sm text-purple-600 hover:text-purple-700 py-1"
              >
                {showProxy ? 'Ẩn Proxy Bid' : 'Cài Proxy Bid (tự động đặt giá)'}
              </button>

              {showProxy && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Giá tối đa bạn chấp nhận"
                    className="flex-1 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => proxyMutation.mutate()}
                    disabled={!maxAmount || proxyMutation.isPending}
                    className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:opacity-80 disabled:opacity-50 transition-opacity"
                  >
                    Cài
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dutch buy button */}
          {isActive && isDutch && user && (
            <div>
              <p className="text-xs text-gray-400 mb-2">
                Nhấn MUA để sở hữu ngay với giá hiện tại
              </p>
              <button
                onClick={() => dutchMutation.mutate()}
                disabled={dutchMutation.isPending}
                className="w-full py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {dutchMutation.isPending ? 'Đang xử lý...' : `MUA NGAY — ${formatVND(auction.currentPrice)}`}
              </button>
            </div>
          )}

          {/* Sealed bid form */}
          {isActive && isSealed && user && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Giá đặt kín của bạn (chỉ 1 lần)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Nhập giá..."
                  className="flex-1 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => sealedMutation.mutate()}
                  disabled={!bidAmount || sealedMutation.isPending}
                  className="px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {sealedMutation.isPending ? 'Đang gửi...' : 'Gửi giá'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tiền sẽ bị khóa ngay khi xác nhận. Kết quả công bố khi hết 24 giờ.
              </p>
            </div>
          )}

          {/* Login prompt */}
          {!user && isActive && (
            <Link
              to="/login"
              className="block w-full py-3 text-center bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
            >
              Đăng nhập để tham gia đấu giá
            </Link>
          )}
        </div>

        {/* Right — Bids + Chat */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(['bids', 'chat'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'bids' ? 'Lịch sử đặt giá' : 'Chat phòng'}
                </button>
              ))}
            </div>

            <div className="p-3">
              {activeTab === 'bids' ? (
                isSealed && !isEnded ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Kết quả sẽ được công bố khi phiên kết thúc
                  </p>
                ) : isEnded && isSealed && sealedBids.length > 0 ? (
                  <div className="space-y-2">
                    {sealedBids.map((bid, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${i === 0 ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <div className="flex items-center gap-2">
                          {i === 0 && <Trophy size={13} className="text-purple-600" />}
                          <span className="text-sm font-medium">{bid.nickname}</span>
                        </div>
                        <span className="text-sm font-medium text-purple-600">{formatVND(bid.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <BidHistory bids={bids} />
                )
              ) : (
                <ChatPanel
                  messages={messages}
                  auctionId={id!}
                  userId={user?.id ?? ''}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}