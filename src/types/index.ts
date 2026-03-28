// ── Enums ──────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN'
export type ItemStatus = 'PENDING' | 'APPROVED' | 'IN_AUCTION' | 'IN_INVENTORY' | 'SHIPPED' | 'REJECTED'
export type ItemRarity = 'COMMON' | 'RARE' | 'LEGENDARY'
export type AuctionStatus = 'WAITING' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
export type SessionType = 'ENGLISH' | 'DUTCH' | 'SEALED'
export type SessionStatus = 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED'
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'BID_LOCK' | 'BID_UNLOCK' | 'FINAL_PAYMENT' | 'PLATFORM_FEE'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type NotificationType = 'OUTBID' | 'AUCTION_WON' | 'WATCHLIST_ALERT' | 'FINANCE' | 'MODERATION' | 'ITEM_REJECTED'

// ── API Response wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  errorCode?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ── User ────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  nickname: string
  avatarUrl: string | null
  phone: string | null
  address: string | null
  reputationScore: number
  role: UserRole
  isBanned: boolean
  isMuted: boolean
  bannedAt: string | null
  createdAt: string
}

// ── Wallet ──────────────────────────────────────────────────
export interface Wallet {
  balanceAvailable: number
  balanceLocked: number
}

export interface Transaction {
  id: string
  walletId: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  referenceId: string | null
  description: string | null
  createdAt: string
}

export interface DepositResponse {
  transactionId: string
  transferCode: string
  bankAccount: string
  amount: number
  expiredAt: string
}

// ── Item ────────────────────────────────────────────────────
export interface Item {
  id: string
  sellerId: string
  sellerNickname: string
  sellerScore: number
  currentOwnerId: string
  ownerNickname: string
  name: string
  description: string
  imageUrls: string[]
  tags: string[]
  rarity: ItemRarity
  status: ItemStatus
  cooldownUntil: string | null
  createdAt: string
}

// ── Auction Session ─────────────────────────────────────────
export interface AuctionSession {
  id: string
  title: string
  type: SessionType
  startTime: string
  status: SessionStatus
  remainingSeconds: number | null
  createdAt: string
}

// ── Auction ─────────────────────────────────────────────────
export interface Auction {
  id: string
  sessionId: string
  sessionType: SessionType
  itemId: string
  itemName: string
  itemImages: string[]
  itemRarity: ItemRarity
  itemDescription: string
  itemTags: string[]
  sellerId: string
  startPrice: number
  currentPrice: number
  stepPrice: number
  winnerId: string | null
  winnerNickname: string | null
  status: AuctionStatus
  durationSeconds: number
  extendSeconds: number
  endTime: string | null
  orderIndex: number
  decreaseAmount: number | null
  intervalSeconds: number | null
  minPrice: number | null
  version: number
  createdAt: string
}

// ── Bid ─────────────────────────────────────────────────────
export interface Bid {
  id: string
  amount: number
  bidTime: string
  isProxy: boolean
  nickname: string
  avatarUrl: string | null
}

// ── Market Listing ──────────────────────────────────────────
export interface MarketListing {
  id: string
  itemId: string
  itemName: string
  itemImages: string[]
  itemRarity: ItemRarity
  itemTags: string[]
  itemDescription: string
  sellerId: string
  sellerNickname: string
  sellerScore: number
  askingPrice: number
  buyerId: string | null
  status: ListingStatus
  createdAt: string
  updatedAt: string
}

// ── Message ─────────────────────────────────────────────────
export interface Message {
  id: string
  senderId: string
  senderNickname: string
  senderAvatar: string | null
  content: string
  createdAt: string
}

// ── Notification ────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

// ── Rating ──────────────────────────────────────────────────
export interface Rating {
  id: string
  fromUserId: string
  fromNickname: string
  fromAvatar: string | null
  toUserId: string
  auctionId: string | null
  marketListingId: string | null
  stars: number
  comment: string
  createdAt: string
}

// ── WebSocket Payloads ──────────────────────────────────────
export interface AuctionUpdatePayload {
  currentPrice: number
  winnerId: string | null
  winnerNickname: string | null
  endTime: string
}

export interface TimerTickPayload {
  remainingSeconds: number
  endTime: string
}

export interface DutchPriceDropPayload {
  currentPrice: number
  minPrice: number
  previousPrice: number
}

export interface AuctionEndedPayload {
  auctionId: string
  winnerId: string | null
  finalPrice: number
  status: string
}

export interface SealedRevealPayload {
  winnerId: string | null
  winnerNickname: string | null
  winnerAmount: number | null
  allBids: { nickname: string; amount: number }[]
}

export interface ChatMessagePayload {
  senderId: string
  nickname: string
  avatarUrl: string | null
  content: string
  createdAt: string
}

export interface P2pMessagePayload {
  senderId: string
  marketListingId: string
  content: string
  createdAt: string
}