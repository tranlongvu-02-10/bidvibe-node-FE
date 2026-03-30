import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check } from 'lucide-react'

import { notificationApi } from '../api/notificationApi'
import { useNotificationStore } from '../store/notificationStore'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils/format'
import type { NotificationType } from '../types'

const typeConfig: Record<NotificationType, { label: string; color: string }> = {
  OUTBID:          { label: 'Bị vượt giá',    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'       },
  AUCTION_WON:     { label: 'Thắng đấu giá',  color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  WATCHLIST_ALERT: { label: 'Watchlist',       color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  FINANCE:         { label: 'Tài chính',       color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'   },
  MODERATION:      { label: 'Kiểm duyệt',      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  ITEM_REJECTED:   { label: 'Vật phẩm bị từ chối', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'  },
}

export const NotificationsPage = () => {
  const queryClient = useQueryClient()
  const { markAllRead: markAllReadStore } = useNotificationStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationApi.getNotifications(),
  })

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      markAllReadStore()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const unreadCount = data?.content.filter(n => !n.isRead).length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{unreadCount} chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
          >
            <Check size={14} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.content.length ? (
        <EmptyState
          title="Chưa có thông báo nào"
          description="Thông báo sẽ xuất hiện khi có hoạt động liên quan đến bạn"
        />
      ) : (
        <div className="space-y-2">
          {data.content.map((notif) => {
            const config = typeConfig[notif.type]
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markOneMutation.mutate(notif.id)}
                className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${
                  notif.isRead
                    ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    : 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Bell size={15} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {notif.content && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {notif.content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}