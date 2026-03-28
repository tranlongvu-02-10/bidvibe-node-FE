import apiClient from './client'
import type { MarketListing, Message, PageResponse } from '../types'

export const marketApi = {
  getListings: (params?: { tags?: string; rarity?: string; minPrice?: number; maxPrice?: number; page?: number }) =>
    apiClient.get<PageResponse<MarketListing>>('/api/market/listings', { params }).then(r => r.data),

  getListing: (id: string) =>
    apiClient.get<MarketListing>(`/api/market/listings/${id}`).then(r => r.data),

  createListing: (data: { itemId: string; askingPrice: number }) =>
    apiClient.post<MarketListing>('/api/market/listings', data).then(r => r.data),

  cancelListing: (id: string) =>
    apiClient.delete<MarketListing>(`/api/market/listings/${id}`).then(r => r.data),

  buyListing: (id: string) =>
    apiClient.post<MarketListing>(`/api/market/listings/${id}/buy`, {}).then(r => r.data),

  getMessages: (id: string) =>
    apiClient.get<Message[]>(`/api/market/listings/${id}/messages`).then(r => r.data),

  sendMessage: (id: string, content: string) =>
    apiClient.post<Message>(`/api/market/listings/${id}/messages`, { content }).then(r => r.data),
}