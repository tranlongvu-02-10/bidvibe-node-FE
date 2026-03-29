import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'
import { sessionApi } from '../api/sessionApi'
import { SessionCard } from '../components/SessionCard'
import { PageSpinner } from '../components/ui/Spinner'

export const HomePage = () => {
  const { data: liveSessions, isLoading: loadingLive } = useQuery({
    queryKey: ['sessions', 'ACTIVE'],
    queryFn:  () => sessionApi.getSessions({ status: 'ACTIVE', page: 0 }),
  })

  const { data: upcomingSessions, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['sessions', 'SCHEDULED'],
    queryFn:  () => sessionApi.getSessions({ status: 'SCHEDULED', page: 0 }),
  })

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
          Sàn đấu giá vật phẩm hàng đầu Việt Nam
        </div>

        <h1 className="text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
          Đấu giá thông minh.<br />
          <span className="text-purple-600">Sở hữu độc đáo.</span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Tham gia cộng đồng đấu giá với 3 hình thức: Tăng dần, Giảm dần và Đấu giá kín.
          Mọi giao dịch đều minh bạch và an toàn qua ví tiền ảo.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/sessions"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Khám phá phiên đấu giá
          </Link>
          <Link
            to="/items/submit"
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Ký gửi vật phẩm
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Người dùng',        value: '1,520+' },
              { label: 'Phiên hoàn thành',  value: '8'      },
              { label: 'Vật phẩm đã bán',   value: '240+'   },
              { label: 'Phí sàn',           value: '5%'     },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-medium text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live sessions */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Đang diễn ra</h2>
          </div>
          <Link
            to="/sessions?status=ACTIVE"
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {loadingLive ? (
          <PageSpinner />
        ) : !liveSessions?.content.length ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Hiện không có phiên nào đang diễn ra
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.content.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sắp diễn ra</h2>
          <Link
            to="/sessions?status=SCHEDULED"
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {loadingUpcoming ? (
          <PageSpinner />
        ) : !upcomingSessions?.content.length ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Chưa có phiên nào được lên lịch
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.content.slice(0, 3).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-medium text-center mb-12 text-gray-900 dark:text-white">
            Tại sao chọn BidVibe?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp size={20} className="text-purple-600" />,
                title: '3 hình thức đấu giá',
                desc:  'Tăng dần, Giảm dần và Đấu giá kín — mỗi hình thức mang lại trải nghiệm khác nhau.',
              },
              {
                icon: <Shield size={20} className="text-purple-600" />,
                title: 'An toàn & Minh bạch',
                desc:  'Ví tiền ảo với escrow tự động. Tiền được bảo vệ trong mọi giao dịch.',
              },
              {
                icon: <Zap size={20} className="text-purple-600" />,
                title: 'Real-time',
                desc:  'Giá cập nhật tức thì qua WebSocket. Không cần refresh trang.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}