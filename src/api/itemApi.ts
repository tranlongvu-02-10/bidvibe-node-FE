import apiClient from './client'
import type { Item, PageResponse } from '../types'

export const itemApi = {
  getItem: (id: string) =>
    apiClient.get<Item>(`/api/items/${id}`).then(r => r.data),

  submitItem: (data: { name: string; description: string; imageUrls: string[]; tags: string[]; rarity: string }) =>
    apiClient.post<Item>('/api/items', data).then(r => r.data),

  getInventory: (page = 0) =>
    apiClient.get<PageResponse<Item>>('/api/items/me/inventory', { params: { page } }).then(r => r.data),

  confirmReceipt: (id: string) =>
    apiClient.patch<Item>(`/api/items/${id}/confirm-receipt`).then(r => r.data),
}