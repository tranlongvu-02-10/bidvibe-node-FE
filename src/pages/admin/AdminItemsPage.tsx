import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { Pagination } from '../../components/ui/Pagination'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate, rarityLabel, rarityColor } from '../../utils/format'
import type { Item, ItemRarity } from '../../types'

// ── Approve Modal ──────────────────────────────────────────
const ApproveModal = ({ item, onClose }: { item: Item; onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    tags:       item.tags?.join(', ') || '',
    rarity:     item.rarity as ItemRarity,
    startPrice: '',
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.approveItem(item.id, {
      tags:       form.tags.split(',').map(t => t.trim()).filter(Boolean),
      rarity:     form.rarity,
      startPrice: parseFloat(form.startPrice),
    }),
    onSuccess: () => {
      toast.success('Đã duyệt vật phẩm!')
      queryClient.invalidateQueries({ queryKey: ['admin-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      onClose()
    },
    onError: () => toast.error('Duyệt thất bại'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-1">Duyệt vật phẩm</h3>
        <p className="text-sm text-gray-400 mb-4">{item.name}</p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="sneaker, jordan, vintage"
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Độ hiếm</label>
            <select
              value={form.rarity}
              onChange={(e) => setForm(p => ({ ...p, rarity: e.target.value as ItemRarity }))}
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none"
            >
              <option value="COMMON">Phổ thông</option>
              <option value="RARE">Hiếm</option>
              <option value="LEGENDARY">Huyền thoại</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Giá khởi điểm (VNĐ)</label>
            <input
              type="number"
              value={form.startPrice}
              onChange={(e) => setForm(p => ({ ...p, startPrice: e.target.value }))}
              placeholder="1000000"
              className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.startPrice || mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang duyệt...' : 'Duyệt'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reject Modal ───────────────────────────────────────────
const RejectModal = ({ item, onClose }: { item: Item; onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: () => adminApi.rejectItem(item.id, reason),
    onSuccess: () => {
      toast.success('Đã từ chối vật phẩm')
      queryClient.invalidateQueries({ queryKey: ['admin-items'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      onClose()
    },
    onError: () => toast.error('Thao tác thất bại'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-1">Từ chối vật phẩm</h3>
        <p className="text-sm text-gray-400 mb-4">{item.name}</p>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Lý do từ chối</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ảnh không đủ rõ, thiếu mô tả..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            Hủy
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!reason.trim() || mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang từ chối...' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main AdminItemsPage ────────────────────────────────────
export const AdminItemsPage = () => {
  const [page,    setPage]    = useState(0)
  const [status,  setStatus]  = useState('PENDING')
  const [selected, setSelected] = useState<Item | null>(null)
  const [action,   setAction]   = useState<'approve' | 'reject' | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-items', status, page],
    queryFn:  () => adminApi.getItems({ status, page }),
  })

  const statusOptions = [
    { value: 'PENDING',      label: 'Chờ duyệt'     },
    { value: 'APPROVED',     label: 'Đã duyệt'       },
    { value: 'IN_AUCTION',   label: 'Đang đấu giá'  },
    { value: 'IN_INVENTORY', label: 'Trong kho'      },
    { value: 'REJECTED',     label: 'Bị từ chối'     },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Quản lý vật phẩm</h1>
        <p className="text-sm text-gray-400 mt-0.5">{data?.totalElements ?? 0} vật phẩm</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatus(opt.value); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              status === opt.value
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState title={`Không có item ${statusOptions.find(s => s.value === status)?.label.toLowerCase()}`} />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Vật phẩm', 'Người gửi', 'Độ hiếm', 'Ngày gửi', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                          {item.imageUrls?.[0]
                            ? <img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                            : <Package size={16} className="m-auto mt-2.5 text-gray-400" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.sellerNickname}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rarityColor[item.rarity]}`}>
                        {rarityLabel[item.rarity]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelected(item); setAction('approve') }}
                            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => { setSelected(item); setAction('reject') }}
                            className="px-3 py-1.5 text-xs bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}

      {selected && action === 'approve' && (
        <ApproveModal item={selected} onClose={() => { setSelected(null); setAction(null) }} />
      )}
      {selected && action === 'reject' && (
        <RejectModal item={selected} onClose={() => { setSelected(null); setAction(null) }} />
      )}
    </div>
  )
}