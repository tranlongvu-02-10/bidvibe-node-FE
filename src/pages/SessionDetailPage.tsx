import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Package, ArrowLeft } from 'lucide-react'
import { sessionApi } from '../api/sessionApi'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatVND, formatDate, formatCountdown } from '../utils/format'
import { useCountdown } from '../hooks/useCountdown'
import type { Auction } from '../types'

const typeConfig = {
  ENGLISH: { label: 'Tăng dần',    variant: 'purple' as const },
  DUTCH:   { label: 'Giảm dần',    variant: 'amber'  as const },
  SEALED:  { label: 'Đấu giá kín', variant: 'teal'   as const },
}

const AuctionCard = ({ auction }: { auction: Auction }) => {
  const { remaining } = useCountdown(
    auction.status === 'ACTIVE' ? auction.endTime : null
  )

  const statusVariant = {
    WAITING:   'gray',
    ACTIVE:    'green',
    ENDED:     'gray',
    CANCELLED: 'red',
  }[auction.status] as 'gray' | 'green' | 'red'

  const statusLabel = {
    WAITING:   'Chờ',
    ACTIVE:    'Đang đấu',
    ENDED:     'Đã kết thúc',
    CANCELLED: 'Đã hủy',
  }[auction.status]

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      {/* Item image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
        {auction.itemImages?.[0] ? (
          <img
            src={auction.itemImages[0]}
            alt={auction.itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Rarity badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={
            auction.itemRarity === 'LEGENDARY' ? 'amber' :
            auction.itemRarity === 'RARE'      ? 'purple' : 'gray'
          }>
            {auction.itemRarity === 'LEGENDARY' ? 'Huyền thoại' :
             auction.itemRarity === 'RARE'      ? 'Hiếm' : 'Phổ thông'}
          </Badge>
        </div>

        {/* Active countdown overlay */}
        {auction.status === 'ACTIVE' && remaining > 0 && (
          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium bg-black/70 text-white ${remaining <= 10 ? 'animate-pulse' : ''}`}>
            {formatCountdown(remaining)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <span className="text-xs text-gray-400">#{auction.orderIndex + 1}</span>
        </div>

        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 line-clamp-2">
          {auction.itemName}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              {auction.status === 'ACTIVE' ? 'Giá hiện tại' : 'Giá khởi điểm'}
            </p>
            <p className="text-base font-medium text-purple-600 dark:text-purple-400">
              {formatVND(auction.currentPrice)}
            </p>
          </div>
          {auction.winnerId && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Người thắng</p>
              <p className="text-xs font-medium text-green-600">{auction.winnerNickname}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ['session', id],
    queryFn:  () => sessionApi.getSession(id!),
    enabled:  !!id,
  })

  const { data: auctions, isLoading: loadingAuctions } = useQuery({
    queryKey: ['session-auctions', id],
    queryFn:  () => sessionApi.getSessionAuctions(id!),
    enabled:  !!id,
    refetchInterval: session?.status === 'ACTIVE' ? 5000 : false,
  })

  if (loadingSession) return <PageSpinner />

  if (!session) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <EmptyState title="Phiên không tồn tại" />
    </div>
  )

  const type = typeConfig[session.type]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to="/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft size={14} />
        Danh sách phiên
      </Link>

      {/* Session header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={type.variant}>{type.label}</Badge>
              {session.status === 'ACTIVE' && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Đang live
                </div>
              )}
            </div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
              {session.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Clock size={13} />
              <span>{formatDate(session.startTime)}</span>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {auctions?.length ?? 0}
              </p>
              <p className="text-xs text-gray-400">vật phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-medium text-gray-900 dark:text-white">
                {auctions?.filter(a => a.status === 'ENDED' && a.winnerId).length ?? 0}
              </p>
              <p className="text-xs text-gray-400">đã bán</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auctions grid */}
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">
        Các vật phẩm trong phiên
      </h2>

      {loadingAuctions ? (
        <PageSpinner />
      ) : !auctions?.length ? (
        <EmptyState
          title="Chưa có vật phẩm nào"
          description="Admin chưa thêm vật phẩm vào phiên này"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  )
}