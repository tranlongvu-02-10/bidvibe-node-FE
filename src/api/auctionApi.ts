import apiClient from './client'
import type { Auction, Bid, Message, PageResponse } from '../types'

export const auctionApi = {
  getAuction: (id: string) =>
    apiClient.get<Auction>(`/api/auctions/${id}`).then(r => r.data),

  getBids: (id: string, page = 0) =>
    apiClient.get<PageResponse<Bid>>(`/api/auctions/${id}/bids`, { params: { page } }).then(r => r.data),

  placeBid: (id: string, amount: number) =>
    apiClient.post<Bid>(`/api/auctions/${id}/bids`, { amount }).then(r => r.data),

  setProxyBid: (id: string, maxAmount: number) =>
    apiClient.post(`/api/auctions/${id}/proxy-bid`, { maxAmount }).then(r => r.data),

  cancelProxyBid: (id: string) =>
    apiClient.delete(`/api/auctions/${id}/proxy-bid`).then(r => r.data),

  buyDutch: (id: string) =>
    apiClient.post(`/api/auctions/${id}/buy`, {}).then(r => r.data),

  placeSealedBid: (id: string, amount: number) =>
    apiClient.post(`/api/auctions/${id}/sealed-bid`, { amount }).then(r => r.data),

  getMessages: (id: string, page = 0) =>
    apiClient.get<PageResponse<Message>>(`/api/auctions/${id}/messages`, { params: { page } }).then(r => r.data),

  sendMessage: (id: string, content: string) =>
    apiClient.post<Message>(`/api/auctions/${id}/messages`, { content }).then(r => r.data),
}