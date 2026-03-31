import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, HeartOff, ArrowLeft, Star, Package, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { itemApi } from '../api/itemApi'
import { userApi } from '../api/userApi'
import { ratingApi } from '../api/ratingApi'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { formatDate, rarityLabel, rarityColor } from '../utils/format'
import type { ItemStatus } from '../types'

// ── Rating Modal ───────────────────────────────────────────
const RatingModal = ({
  toUserId,
  auctionId,
  marketListingId,
  onClose,
}: {
  toUserId: string
  auctionId: string | null
  marketListingId: string | null
  onClose: () => void
}) => {
  const [stars,   setStars]   = useState(5)
  const [comment, setComment] = useState('')
  const [hover,   setHover]   = useState(0)

  const mutation = useMutation({
    mutationFn: () => ratingApi.createRating({
      toUserId, auctionId, marketListingId, stars, comment,
    }),
    onSuccess: () => {
      toast.success('Đã gửi đánh giá!')
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Gửi đánh giá thất bại'
      toast.error(msg)
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-4">Đánh giá giao dịch</h3>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setHover(i + 1)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(i + 1)}
            >
              <Star
                size={28}
                className={`transition-colors ${
                  i < (hover || stars)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">
          {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][stars]}
        </p>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhận xét về giao dịch..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl"
          >
            Bỏ qua
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ItemDetailPage ────────────────────────────────────
export const ItemDetailPage = () => {
  const { id }    = useParams<{ id: string }>()
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const queryClient = useQueryClient()
  const [selectedImg, setSelectedImg] = useState(0)
  const [showRating,  setShowRating]  = useState(false)

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn:  () => itemApi.getItem(id!),
    enabled:  !!id,
  })

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn:  () => userApi.getWatchlist(),
    enabled:  !!user,
  })

  const isWatched = watchlistData?.content?.some((w: { id: string }) => w.id === id) ?? false

  const watchMutation = useMutation({
    mutationFn: () => isWatched
      ? userApi.removeFromWatchlist(id!)
      : userApi.addToWatchlist(id!),
    onSuccess: () => {
      toast.success(isWatched ? 'Đã bỏ theo dõi' : 'Đã thêm vào watchlist')
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
  })

  if (isLoading) return <PageSpinner />
  if (!item) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-center text-gray-400">Vật phẩm không tồn tại</p>
    </div>
  )

  const statusConfig: Record<ItemStatus, { label: string; variant: 'gray' | 'purple' | 'green' | 'teal' | 'red' }> = {
    PENDING:      { label: 'Chờ duyệt',      variant: 'gray'   },
    APPROVED:     { label: 'Đã duyệt',        variant: 'purple' },
    IN_AUCTION:   { label: 'Đang đấu giá',   variant: 'green'  },
    IN_INVENTORY: { label: 'Đang lưu kho',   variant: 'gray'   },
    SHIPPED:      { label: 'Đã giao hàng',   variant: 'teal'   },
    REJECTED:     { label: 'Bị từ chối',      variant: 'red'    },
  }

  const sc = statusConfig[item.status]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={14} />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Image gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {item.imageUrls?.length > 0 ? (
              <img
                src={item.imageUrls[selectedImg]}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={48} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {item.imageUrls?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === selectedImg
                      ? 'border-purple-600'
                      : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${rarityColor[item.rarity]}`}>
              {rarityLabel[item.rarity]}
            </span>
            <Badge variant={sc.variant}>{sc.label}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white leading-tight">
            {item.name}
          </h1>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Seller info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Người ký gửi</p>
              <Link
                to={`/users/${item.sellerId}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-600">
                  {item.sellerNickname?.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.sellerNickname}
                </span>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Number(item.sellerScore).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="text-xs text-gray-400">
            Ngày ký gửi: {formatDate(item.createdAt)}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {/* Watchlist button */}
            {user && (
              <button
                onClick={() => watchMutation.mutate()}
                disabled={watchMutation.isPending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors ${
                  isWatched
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {isWatched
                  ? <><HeartOff size={15} /> Bỏ theo dõi</>
                  : <><Heart size={15} /> Theo dõi vật phẩm</>
                }
              </button>
            )}

            {/* Go to auction */}
            {item.status === 'IN_AUCTION' && (
              <Link
                to="/sessions"
                className="block w-full py-3 text-center text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Vào phòng đấu giá
              </Link>
            )}

            {/* Confirm receipt */}
            {item.status === 'IN_INVENTORY' && user?.id === item.currentOwnerId && (
              <button
                onClick={() => setShowRating(true)}
                className="w-full py-3 text-sm border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Đánh giá giao dịch
              </button>
            )}

            {/* Owner info */}
            {item.status === 'IN_INVENTORY' && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600">
                  {item.ownerNickname?.slice(0, 1).toUpperCase()}
                </div>
                <p className="text-xs text-gray-400">
                  Đang sở hữu bởi <span className="font-medium text-gray-600 dark:text-gray-300">{item.ownerNickname}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRating && (
        <RatingModal
          toUserId={item.sellerId}
          auctionId={null}
          marketListingId={null}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  )
}