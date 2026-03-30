import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Star, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { marketApi } from '../api/marketApi'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { formatVND, rarityLabel, rarityColor } from '../utils/format'

export const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const [chatInput,   setChatInput]   = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn:  () => marketApi.getListing(id!),
    enabled:  !!id,
  })

  const { data: messages } = useQuery({
    queryKey: ['listing-messages', id],
    queryFn: () => marketApi.getMessages(id!),
    enabled:  !!id && !!user,
    refetchInterval: 5000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buyMutation = useMutation({
    mutationFn: () => marketApi.buyListing(id!),
    onSuccess: () => {
      toast.success('Mua hàng thành công!')
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      setShowConfirm(false)
      navigate('/me/inventory')
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Mua hàng thất bại'
      toast.error(msg)
      setShowConfirm(false)
    },
  })

  const sendMutation = useMutation({
    mutationFn: () => marketApi.sendMessage(id!, chatInput.trim()),
    onSuccess: () => {
      setChatInput('')
      queryClient.invalidateQueries({ queryKey: ['listing-messages', id] })
    },
  })

  if (isLoading) return <PageSpinner />
  if (!listing) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
      Listing không tồn tại
    </div>
  )

  const isSeller  = user?.id === listing.sellerId
  const isBuyer   = user?.id === listing.buyerId
  const canChat   = user && (isSeller || isBuyer || listing.status === 'ACTIVE')
  const canBuy    = user && !isSeller && listing.status === 'ACTIVE'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/market"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={14} />
        Chợ Đen
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Images + Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {listing.itemImages?.[0] ? (
              <img
                src={listing.itemImages[0]}
                alt={listing.itemName}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={48} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Item info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rarityColor[listing.itemRarity]}`}>
                {rarityLabel[listing.itemRarity]}
              </span>
              <Badge variant={listing.status === 'ACTIVE' ? 'green' : listing.status === 'SOLD' ? 'gray' : 'red'}>
                {listing.status === 'ACTIVE' ? 'Đang bán' : listing.status === 'SOLD' ? 'Đã bán' : 'Đã hủy'}
              </Badge>
            </div>

            <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {listing.itemName}
            </h1>

            {listing.itemDescription && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                {listing.itemDescription}
              </p>
            )}

            {/* Tags */}
            {listing.itemTags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {listing.itemTags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chat P2P */}
          {canChat && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Chat với {isSeller ? 'người mua' : 'người bán'}</h3>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {!messages?.length ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chưa có tin nhắn. Hỏi thêm về sản phẩm!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600 flex-shrink-0">
                        {msg.senderNickname?.slice(0, 1).toUpperCase()}
                      </div>
                      <div className={`max-w-[75%] px-3 py-1.5 rounded-xl text-sm ${
                        msg.senderId === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && chatInput.trim() && sendMutation.mutate()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => sendMutation.mutate()}
                  disabled={!chatInput.trim() || sendMutation.isPending}
                  className="w-9 h-9 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Seller info + Buy */}
        <div className="space-y-4">
          {/* Price + Buy */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-1">Giá bán</p>
            <p className="text-3xl font-medium text-purple-600 dark:text-purple-400 mb-4">
              {formatVND(listing.askingPrice)}
            </p>

            {canBuy && (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
              >
                Mua ngay
              </button>
            )}

            {isSeller && listing.status === 'ACTIVE' && (
              <div className="text-center text-sm text-gray-400 py-2">
                Đây là vật phẩm của bạn
              </div>
            )}

            {listing.status !== 'ACTIVE' && (
              <div className="text-center text-sm text-gray-400 py-2">
                {listing.status === 'SOLD' ? 'Đã bán' : 'Listing đã bị hủy'}
              </div>
            )}

            {!user && listing.status === 'ACTIVE' && (
              <Link
                to="/login"
                className="block w-full py-3 text-center bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700"
              >
                Đăng nhập để mua
              </Link>
            )}
          </div>

          {/* Seller info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h3 className="text-xs text-gray-400 mb-3">Người bán</h3>
            <Link
              to={`/users/${listing.sellerId}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium text-purple-600">
                {listing.sellerNickname?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {listing.sellerNickname}
                </p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < Math.round(listing.sellerScore) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {Number(listing.sellerScore).toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6">
            <h3 className="text-base font-medium mb-2">Xác nhận mua hàng</h3>
            <p className="text-sm text-gray-400 mb-1">{listing.itemName}</p>
            <p className="text-xl font-medium text-purple-600 mb-4">
              {formatVND(listing.askingPrice)}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Phí sàn 5% ({formatVND(listing.askingPrice * 0.05)}) sẽ được trừ từ người bán.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => buyMutation.mutate()}
                disabled={buyMutation.isPending}
                className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {buyMutation.isPending ? 'Đang xử lý...' : 'Xác nhận mua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}