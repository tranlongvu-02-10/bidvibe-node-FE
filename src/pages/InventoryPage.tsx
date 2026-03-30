import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Clock, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { itemApi } from '../api/itemApi'
import { marketApi } from '../api/marketApi'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatVND, formatDate, rarityLabel, rarityColor } from '../utils/format'
import type { Item } from '../types'

// ── Sell Modal ─────────────────────────────────────────────
const SellModal = ({ item, onClose }: { item: Item; onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [price, setPrice] = useState('')

  const mutation = useMutation({
    mutationFn: () => marketApi.createListing({
      itemId:      item.id,
      askingPrice: parseFloat(price),
    }),
    onSuccess: () => {
      toast.success('Đã niêm yết lên Chợ Đen!')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Niêm yết thất bại'
      toast.error(msg)
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-1">Rao bán lên Chợ Đen</h3>
        <p className="text-sm text-gray-400 mb-4">{item.name}</p>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Giá bán (VNĐ)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1000000"
            className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Bạn nhận được {price ? formatVND(parseFloat(price) * 0.95) : '---'} sau phí sàn 5%
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!price || mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang niêm yết...' : 'Niêm yết'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Item Card ──────────────────────────────────────────────
const InventoryCard = ({ item }: { item: Item }) => {
  const queryClient = useQueryClient()
  const [showSell, setShowSell] = useState(false)

  const inCooldown = item.cooldownUntil && new Date(item.cooldownUntil) > new Date()

  const confirmMutation = useMutation({
    mutationFn: () => itemApi.confirmReceipt(item.id),
    onSuccess: () => {
      toast.success('Đã xác nhận nhận hàng!')
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: () => toast.error('Xác nhận thất bại'),
  })

  const statusVariant = {
    PENDING:      'gray',
    APPROVED:     'purple',
    IN_AUCTION:   'green',
    IN_INVENTORY: 'gray',
    SHIPPED:      'teal',
    REJECTED:     'red',
  }[item.status] as 'gray' | 'purple' | 'green' | 'teal' | 'red'

  const statusLabel = {
    PENDING:      'Chờ duyệt',
    APPROVED:     'Đã duyệt',
    IN_AUCTION:   'Đang đấu giá',
    IN_INVENTORY: 'Trong kho',
    SHIPPED:      'Đã giao',
    REJECTED:     'Bị từ chối',
  }[item.status]

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        {/* Image */}
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
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            <Link to={`/items/${item.id}`}>
              <Eye size={14} className="text-gray-400 hover:text-gray-600" />
            </Link>
          </div>

          <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-2 mb-3 line-clamp-2">
            {item.name}
          </h3>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {/* Đang đấu giá */}
            {item.status === 'IN_AUCTION' && (
              <Link
                to={`/sessions`}
                className="block w-full py-2 text-center text-sm text-purple-600 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Xem phòng đấu giá
              </Link>
            )}

            {/* Trong kho — có thể bán */}
            {item.status === 'IN_INVENTORY' && !inCooldown && (
              <button
                onClick={() => setShowSell(true)}
                className="w-full py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                Rao bán lên Chợ Đen
              </button>
            )}

            {/* Cooldown */}
            {item.status === 'IN_INVENTORY' && inCooldown && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <Clock size={12} />
                <span>Cooldown đến {formatDate(item.cooldownUntil!)}</span>
              </div>
            )}

            {/* Xác nhận nhận hàng */}
            {item.status === 'IN_INVENTORY' && (
              <button
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="w-full py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-gray-600 dark:text-gray-300"
              >
                {confirmMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showSell && <SellModal item={item} onClose={() => setShowSell(false)} />}
    </>
  )
}

// ── Main InventoryPage ─────────────────────────────────────
export const InventoryPage = () => {
  const [page] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page],
    queryFn:  () => itemApi.getInventory(page),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Kho đồ</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {data?.totalElements ?? 0} vật phẩm
          </p>
        </div>
        <Link
          to="/items/submit"
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Ký gửi thêm
        </Link>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState
          title="Kho đồ trống"
          description="Tham gia đấu giá hoặc mua trên Chợ Đen để có vật phẩm"
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
          {data.content.map((item) => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}