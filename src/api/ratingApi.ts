import apiClient from './client'
import type { Rating } from '../types'

export const ratingApi = {
  createRating: (data: {
    toUserId: string
    auctionId: string | null
    marketListingId: string | null
    stars: number
    comment: string
  }) => apiClient.post<Rating>('/api/ratings', data).then(r => r.data),
}