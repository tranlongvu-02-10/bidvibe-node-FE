import apiClient from './client'
import type { Notification, PageResponse } from '../types'

export const notificationApi = {
  getNotifications: (page = 0) =>
    apiClient.get<PageResponse<Notification>>('/api/notifications', { params: { page } }).then(r => r.data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/api/notifications/unread-count').then(r => r.data),

  markRead: (id: string) =>
    apiClient.patch<Notification>(`/api/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    apiClient.post('/api/notifications/read-all').then(r => r.data),
}