import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '../api/userApi'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { rarityLabel, rarityColor } from '../utils/format'
import type { Item } from '../types'

export const WatchlistPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn:  () => userApi.getWatchlist(),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => userApi.removeFromWatchlist(itemId),
    onSuccess: () => {
      toast.success('Đã bỏ theo dõi')
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
    },
    onError: () => toast.error('Thao tác thất bại'),
  })

  const statusLabel: Record<string, string> = {
    PENDING:      'Chờ duyệt',
    APPROVED:     'Đã duyệt',
    IN_AUCTION:   'Đang đấu giá',
    IN_INVENTORY: 'Trong kho',
    SHIPPED:      'Đã giao',
    REJECTED:     'Bị từ chối',
  }

  const statusVariant: Record<string, 'gray' | 'purple' | 'green' | 'teal' | 'red'> = {
    PENDING:      'gray',
    APPROVED:     'purple',
    IN_AUCTION:   'green',
    IN_INVENTORY: 'gray',
    SHIPPED:      'teal',
    REJECTED:     'red',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Watchlist</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {data?.totalElements ?? 0} vật phẩm đang theo dõi
        </p>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState
          title="Watchlist trống"
          description="Nhấn Tim trên trang vật phẩm để theo dõi và nhận thông báo khi vào phiên đấu giá"
          action={
            <Link
              to="/sessions"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Xem phiên đấu giá
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.content.map((item: Item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
            >
              {/* Image */}
              <Link to={`/items/${item.id}`} className="block">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                  {item.imageUrls?.[0] ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rarityColor[item.rarity]}`}>
                      {rarityLabel[item.rarity]}
                    </span>
                  </div>
                  {/* Live badge */}
                  {item.status === 'IN_AUCTION' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={statusVariant[item.status]}>
                    {statusLabel[item.status]}
                  </Badge>
                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Heart size={14} className="fill-current" />
                  </button>
                </div>
                <Link to={`/items/${item.id}`}>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-purple-600">
                    {item.name}
                  </h3>
                </Link>

                {/* Action button */}
                {item.status === 'IN_AUCTION' && (
                  <Link
                    to="/sessions"
                    className="block mt-2 py-1.5 text-center text-xs text-purple-600 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Vào phòng đấu giá
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}