import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { connectWs, subscribeToTopic } from '../../ws/wsClient'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../api/notificationApi'
import type { Notification } from '../../types'

export const Layout = () => {
  const { user } = useAuthStore()
  const { addNotification, setUnreadCount } = useNotificationStore()

  // Load unread count
  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn:  notificationApi.getUnreadCount,
    enabled:  !!user,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (unreadData) setUnreadCount(unreadData.count)
  }, [unreadData, setUnreadCount])

  // Connect WS khi login
  useEffect(() => {
    if (!user) return

    connectWs(() => {
      // Subscribe notification cá nhân
      subscribeToTopic(`/user/queue/notifications`, (data: unknown) => {
        const notif = data as Notification
        addNotification(notif)
      })
    })
  }, [user, addNotification])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}