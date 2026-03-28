import apiClient from './client'
import type { User, PageResponse, Rating } from '../types'

export const userApi = {
  getMe: () =>
    apiClient.get<User>('/api/users/me').then(r => r.data),

  updateMe: (data: Partial<Pick<User, 'nickname' | 'phone' | 'address'> & { avatarUrl: string }>) =>
    apiClient.put<User>('/api/users/me', data).then(r => r.data),

  getPublicProfile: (id: string) =>
    apiClient.get<User>(`/api/users/${id}`).then(r => r.data),

  getRatings: (id: string, page = 0) =>
    apiClient.get<PageResponse<Rating>>(`/api/users/${id}/ratings`, { params: { page } }).then(r => r.data),

  getWatchlist: (page = 0) =>
    apiClient.get('/api/users/me/watchlist', { params: { page } }).then(r => r.data),

  addToWatchlist: (itemId: string) =>
    apiClient.post('/api/users/me/watchlist', { itemId }).then(r => r.data),

  removeFromWatchlist: (itemId: string) =>
    apiClient.delete(`/api/users/me/watchlist/${itemId}`).then(r => r.data),
}