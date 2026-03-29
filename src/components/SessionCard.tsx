import { Link } from 'react-router-dom'
import { Clock, Package } from 'lucide-react'
import { Badge } from './ui/Badge'
import { formatDate } from '../utils/format'
import type { AuctionSession } from '../types'

const typeConfig = {
  ENGLISH: { label: 'Tăng dần',   variant: 'purple' as const },
  DUTCH:   { label: 'Giảm dần',   variant: 'amber'  as const },
  SEALED:  { label: 'Đấu giá kín', variant: 'teal'   as const },
}

const statusConfig = {
  SCHEDULED: { label: 'Sắp diễn ra', variant: 'gray'   as const },
  ACTIVE:    { label: 'Đang live',   variant: 'green'  as const },
  PAUSED:    { label: 'Tạm dừng',    variant: 'amber'  as const },
  COMPLETED: { label: 'Đã kết thúc', variant: 'gray'   as const },
  CANCELLED: { label: 'Đã hủy',      variant: 'red'    as const },
}

interface SessionCardProps {
  session: AuctionSession
  auctionCount?: number
}

export const SessionCard = ({ session, auctionCount }: SessionCardProps) => {
  const type   = typeConfig[session.type]
  const status = statusConfig[session.status]

  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant={type.variant}>{type.label}</Badge>
        <div className="flex items-center gap-1.5">
          {session.status === 'ACTIVE' && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-4 line-clamp-2">
        {session.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        {auctionCount !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Package size={13} />
            <span>{auctionCount} vật phẩm</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock size={13} />
          <span>{formatDate(session.startTime)}</span>
        </div>
      </div>
    </Link>
  )
}