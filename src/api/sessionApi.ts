import apiClient from './client'
import type { AuctionSession, Auction, PageResponse } from '../types'

export const sessionApi = {
  getSessions: (params?: { status?: string; type?: string; page?: number }) =>
    apiClient.get<PageResponse<AuctionSession>>('/api/sessions', { params }).then(r => r.data),

  getSession: (id: string) =>
    apiClient.get<AuctionSession>(`/api/sessions/${id}`).then(r => r.data),

  getSessionAuctions: (id: string) =>
    apiClient.get<Auction[]>(`/api/sessions/${id}/auctions`).then(r => r.data),
}