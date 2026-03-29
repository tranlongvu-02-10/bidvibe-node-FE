import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { walletApi } from '../api/walletApi'
import { useWalletStore } from '../store/walletStore'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { formatVND, formatDate } from '../utils/format'
import { useState, useEffect } from 'react'
import type { TransactionType, TransactionStatus, Wallet } from '../types'

// ── Transaction type config ────────────────────────────────
const txTypeConfig: Record<TransactionType, { label: string; variant: 'purple' | 'green' | 'amber' | 'red' | 'gray' }> = {
  DEPOSIT:       { label: 'Nạp tiền',     variant: 'green'  },
  WITHDRAW:      { label: 'Rút tiền',     variant: 'amber'  },
  BID_LOCK:      { label: 'Khóa đấu giá', variant: 'purple' },
  BID_UNLOCK:    { label: 'Hoàn cọc',     variant: 'gray'   },
  FINAL_PAYMENT: { label: 'Thanh toán',   variant: 'red'    },
  PLATFORM_FEE:  { label: 'Phí sàn',      variant: 'red'    },
}

const txStatusConfig: Record<TransactionStatus, { label: string; variant: 'green' | 'amber' | 'red' | 'gray' }> = {
  PENDING:   { label: 'Chờ duyệt',  variant: 'amber' },
  COMPLETED: { label: 'Hoàn tất',   variant: 'green' },
  FAILED:    { label: 'Thất bại',   variant: 'red'   },
  CANCELLED: { label: 'Đã hủy',     variant: 'gray'  },
}

// ── Deposit Modal ──────────────────────────────────────────
const DepositModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<{
    transferCode: string
    bankAccount: string
    amount: number
    expiredAt: string
  } | null>(null)

  const mutation = useMutation({
    mutationFn: () => walletApi.deposit(parseFloat(amount)),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
    onError: () => toast.error('Tạo yêu cầu nạp tiền thất bại'),
  })

  const copyCode = () => {
    if (!result) return
    navigator.clipboard.writeText(result.transferCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-4">Nạp tiền</h3>

        {!result ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Nhập số tiền muốn nạp. Hệ thống sẽ tạo mã chuyển khoản riêng cho bạn.
            </p>
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">Số tiền (VNĐ)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500000"
                className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2 mb-4">
              {[100000, 500000, 1000000, 5000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(String(amt))}
                  className="flex-1 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500"
                >
                  {formatVND(amt)}
                </button>
              ))}
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
                disabled={!amount || mutation.isPending}
                className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {mutation.isPending ? 'Đang tạo...' : 'Tạo mã chuyển khoản'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Số tiền</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatVND(result.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tài khoản nhận</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {result.bankAccount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Nội dung CK</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-600">
                    {result.transferCode}
                  </span>
                  <button onClick={copyCode} className="text-gray-400 hover:text-gray-600">
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Hết hạn</span>
                <span className="text-xs text-gray-500">{formatDate(result.expiredAt)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4 text-center">
              Chuyển khoản đúng nội dung để được duyệt tự động
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Đã chuyển khoản
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Withdraw Modal ─────────────────────────────────────────
const WithdrawModal = ({ onClose, maxAmount }: { onClose: () => void; maxAmount: number }) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  })

  const mutation = useMutation({
    mutationFn: () => walletApi.withdraw({
      amount:        parseFloat(form.amount),
      bankName:      form.bankName,
      accountNumber: form.accountNumber,
      accountHolder: form.accountHolder,
    }),
    onSuccess: () => {
      toast.success('Gửi yêu cầu rút tiền thành công!')
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      onClose()
    },
    onError: () => toast.error('Rút tiền thất bại'),
  })

  const isValid = form.amount && form.bankName && form.accountNumber && form.accountHolder
    && parseFloat(form.amount) <= maxAmount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h3 className="text-base font-medium mb-1">Rút tiền</h3>
        <p className="text-sm text-gray-400 mb-4">
          Số dư khả dụng: <span className="font-medium text-gray-900 dark:text-white">{formatVND(maxAmount)}</span>
        </p>

        <div className="space-y-3 mb-4">
          {[
            { key: 'amount',        label: 'Số tiền',         placeholder: '100000',          type: 'number' },
            { key: 'bankName',      label: 'Ngân hàng',       placeholder: 'Vietcombank',     type: 'text'   },
            { key: 'accountNumber', label: 'Số tài khoản',    placeholder: '1234567890',      type: 'text'   },
            { key: 'accountHolder', label: 'Tên chủ tài khoản', placeholder: 'NGUYEN VAN A', type: 'text'   },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
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
            disabled={!isValid || mutation.isPending}
            className="flex-1 py-2.5 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main WalletPage ────────────────────────────────────────
export const WalletPage = () => {
  const { setWallet } = useWalletStore()
  const [showDeposit,  setShowDeposit]  = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [page,         setPage]         = useState(0)
  const [typeFilter,   setTypeFilter]   = useState('')

  const { data: wallet, isLoading: loadingWallet } = useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn:  walletApi.getWallet,
  })

  useEffect(() => {
    if (wallet) setWallet(wallet)
  }, [wallet, setWallet])

  const { data: txData, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', typeFilter, page],
    queryFn:  () => walletApi.getTransactions({
      type: typeFilter || undefined,
      page,
    }),
  })

  if (loadingWallet) return <PageSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-6">Ví tiền</h1>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-1">Số dư khả dụng</p>
          <p className="text-2xl font-medium text-green-600">
            {formatVND(wallet?.balanceAvailable ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Có thể dùng để đấu giá</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-1">Số dư đang giữ</p>
          <p className="text-2xl font-medium text-amber-600">
            {formatVND(wallet?.balanceLocked ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Đang cọc trong đấu giá</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setShowDeposit(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          <ArrowDownCircle size={16} />
          Nạp tiền
        </button>
        <button
          onClick={() => setShowWithdraw(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowUpCircle size={16} />
          Rút tiền
        </button>
      </div>

      {/* Transaction history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900 dark:text-white">
            Lịch sử giao dịch
          </h2>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
            className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none"
          >
            <option value="">Tất cả</option>
            <option value="DEPOSIT">Nạp tiền</option>
            <option value="WITHDRAW">Rút tiền</option>
            <option value="BID_LOCK">Khóa đấu giá</option>
            <option value="BID_UNLOCK">Hoàn cọc</option>
            <option value="FINAL_PAYMENT">Thanh toán</option>
            <option value="PLATFORM_FEE">Phí sàn</option>
          </select>
        </div>

        {loadingTx ? (
          <PageSpinner />
        ) : !txData?.content.length ? (
          <div className="text-center py-12 text-sm text-gray-400">
            Chưa có giao dịch nào
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {txData.content.map((tx) => {
                const typeConf   = txTypeConfig[tx.type]
                const statusConf = txStatusConfig[tx.status]
                const isPlus = ['DEPOSIT', 'BID_UNLOCK'].includes(tx.type)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPlus ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {isPlus
                          ? <ArrowDownCircle size={16} className="text-green-600" />
                          : <ArrowUpCircle  size={16} className="text-red-500" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {typeConf.label}
                          </span>
                          <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${isPlus ? 'text-green-600' : 'text-red-500'}`}>
                      {isPlus ? '+' : '-'}{formatVND(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
            <Pagination
              page={page}
              totalPages={txData.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {showDeposit  && <DepositModal  onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} maxAmount={wallet?.balanceAvailable ?? 0} />}
    </div>
  )
}