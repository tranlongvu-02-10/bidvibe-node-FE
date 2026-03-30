import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Package, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import { adminApi } from '../../api/adminApi'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatVND } from '../../utils/format'

export const AdminDashboard = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn:  adminApi.getOverview,
    refetchInterval: 30000,
  })

  if (isLoading) return <PageSpinner />

  const kpis = [
    {
      label:  'Tổng người dùng',
      value:  overview?.totalUsers ?? 0,
      sub:    `${overview?.activeUsersLast7Days ?? 0} hoạt động 7 ngày`,
      icon:   <Users size={18} className="text-purple-600" />,
      bg:     'bg-purple-50 dark:bg-purple-900/20',
      to:     '/admin/users',
    },
    {
      label:  'Item chờ duyệt',
      value:  overview?.totalItemsPending ?? 0,
      sub:    'Cần xử lý',
      icon:   <Package size={18} className="text-amber-600" />,
      bg:     'bg-amber-50 dark:bg-amber-900/20',
      to:     '/admin/items',
    },
    {
      label:  'Phiên đang chạy',
      value:  overview?.activeSessions ?? 0,
      sub:    `${overview?.completedSessions ?? 0} đã hoàn thành`,
      icon:   <Zap size={18} className="text-green-600" />,
      bg:     'bg-green-50 dark:bg-green-900/20',
      to:     '/admin/sessions',
    },
    {
      label:  'Doanh thu phí sàn',
      value:  formatVND(overview?.totalRevenuePlatformFee ?? 0),
      sub:    'Tổng tích lũy',
      icon:   <TrendingUp size={18} className="text-blue-600" />,
      bg:     'bg-blue-50 dark:bg-blue-900/20',
      to:     '/admin/analytics',
    },
  ]

  const shortcuts = [
    { label: 'Item đang chờ duyệt', to: '/admin/items?status=PENDING',    count: overview?.totalItemsPending ?? 0, urgent: true  },
    { label: 'Phiên đấu giá',       to: '/admin/sessions',                 count: overview?.activeSessions    ?? 0, urgent: false },
    { label: 'Giao dịch pending',   to: '/admin/transactions?status=PENDING', count: null,                          urgent: false },
    { label: 'Quản lý users',       to: '/admin/users',                    count: overview?.totalUsers        ?? 0, urgent: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Tổng quan hoạt động sàn BidVibe</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.to}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-medium text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </Link>
        ))}
      </div>

      {/* Shortcuts */}
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-4">Truy cập nhanh</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shortcuts.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              {s.urgent && s.count! > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</span>
              {s.count !== null && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                  {s.count}
                </span>
              )}
            </div>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}