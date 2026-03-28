import apiClient from './client'
import type { Item, AuctionSession, User, Transaction, PageResponse } from '../types'

export const adminApi = {
  // Items
  getItems: (params?: object) =>
    apiClient.get<PageResponse<Item>>('/api/admin/items', { params }).then(r => r.data),
  approveItem: (id: string, data: { tags: string[]; rarity: string; startPrice: number }) =>
    apiClient.post<Item>(`/api/admin/items/${id}/approve`, data).then(r => r.data),
  rejectItem: (id: string, reason: string) =>
    apiClient.post<Item>(`/api/admin/items/${id}/reject`, { reason }).then(r => r.data),

  // Sessions
  createSession: (data: { title: string; type: string; startTime: string }) =>
    apiClient.post<AuctionSession>('/api/admin/sessions', data).then(r => r.data),
  startSession: (id: string) =>
    apiClient.post(`/api/admin/sessions/${id}/start`).then(r => r.data),
  pauseSession: (id: string) =>
    apiClient.post(`/api/admin/sessions/${id}/pause`).then(r => r.data),
  resumeSession: (id: string) =>
    apiClient.post(`/api/admin/sessions/${id}/resume`).then(r => r.data),
  stopSession: (id: string) =>
    apiClient.post(`/api/admin/sessions/${id}/stop`).then(r => r.data),

  // Users
  getUsers: (params?: object) =>
    apiClient.get<PageResponse<User>>('/api/admin/users', { params }).then(r => r.data),
  banUser: (id: string, reason: string) =>
    apiClient.post(`/api/admin/users/${id}/ban`, { reason }).then(r => r.data),
  unbanUser: (id: string) =>
    apiClient.post(`/api/admin/users/${id}/unban`).then(r => r.data),
  muteUser: (id: string) =>
    apiClient.post(`/api/admin/users/${id}/mute`).then(r => r.data),
  unmuteUser: (id: string) =>
    apiClient.post(`/api/admin/users/${id}/unmute`).then(r => r.data),

  // Finance
  getTransactions: (params?: object) =>
    apiClient.get<PageResponse<Transaction>>('/api/admin/transactions', { params }).then(r => r.data),
  approveTransaction: (id: string) =>
    apiClient.post(`/api/admin/transactions/${id}/approve`).then(r => r.data),
  rejectTransaction: (id: string) =>
    apiClient.post(`/api/admin/transactions/${id}/reject`).then(r => r.data),

  // Analytics
  getOverview: () =>
    apiClient.get('/api/admin/analytics/overview').then(r => r.data),
  getRevenue: (params?: object) =>
    apiClient.get('/api/admin/analytics/revenue', { params }).then(r => r.data),
}