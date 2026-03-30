import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/adminApi'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatVND, formatDate } from '../../utils/format'

export const AdminTransactionsPage = () => {
  const queryClient = useQueryClient()
  const [page,   setPage]   = useState(0)
  const [type,   setType]   = useState('')
  const [status, setStatus] = useState('PENDING')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', type, status, page],
    queryFn:  () => adminApi.getTransactions({
      type:   type   || undefined,
      status: status || undefined,
      page,
    }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveTransaction(id),
    onSuccess: () => {
      toast.success('Đã duyệt giao dịch')
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
    },
    onError: () => toast.error('Duyệt thất bại'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectTransaction(id),
    onSuccess: () => {
      toast.success('Đã từ chối giao dịch')
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
    },
    onError: () => toast.error('Từ chối thất bại'),
  })

  const typeLabels: Record<string, string> = {
    DEPOSIT: 'Nạp tiền', WITHDRAW: 'Rút tiền',
    BID_LOCK: 'Khóa đấu giá', BID_UNLOCK: 'Hoàn cọc',
    FINAL_PAYMENT: 'Thanh toán', PLATFORM_FEE: 'Phí sàn',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Duyệt tài chính</h1>
        <p className="text-sm text-gray-400 mt-0.5">{data?.totalElements ?? 0} giao dịch</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {[
            { value: 'PENDING',   label: 'Chờ duyệt' },
            { value: 'COMPLETED', label: 'Hoàn tất'  },
            { value: '',          label: 'Tất cả'    },
          ].map((opt) => (
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

        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(0) }}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none"
        >
          <option value="">Tất cả loại</option>
          <option value="DEPOSIT">Nạp tiền</option>
          <option value="WITHDRAW">Rút tiền</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState title="Không có giao dịch nào" />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Người dùng', 'Loại', 'Số tiền', 'Mô tả', 'Trạng thái', 'Thời gian', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(tx as unknown as { nickname: string }).nickname}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(tx as unknown as { email: string }).email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === 'DEPOSIT' ? 'green' : tx.type === 'WITHDRAW' ? 'amber' : 'gray'}>
                        {typeLabels[tx.type] || tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatVND(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400 max-w-xs truncate">{tx.description || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        tx.status === 'COMPLETED' ? 'green' :
                        tx.status === 'PENDING'   ? 'amber' :
                        tx.status === 'CANCELLED' ? 'gray'  : 'red'
                      }>
                        {tx.status === 'COMPLETED' ? 'Hoàn tất' :
                         tx.status === 'PENDING'   ? 'Chờ duyệt' :
                         tx.status === 'CANCELLED' ? 'Đã hủy'   : 'Thất bại'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => approveMutation.mutate(tx.id)}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle size={11} /> Duyệt
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(tx.id)}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          >
                            <XCircle size={11} /> Từ chối
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
    </div>
  )
}