import apiClient from './client'
import type { Wallet, Transaction, DepositResponse, PageResponse } from '../types'

export const walletApi = {
  getWallet: () =>
    apiClient.get<Wallet>('/api/wallet').then(r => r.data),

  deposit: (amount: number) =>
    apiClient.post<DepositResponse>('/api/wallet/deposit', { amount }).then(r => r.data),

  withdraw: (data: { amount: number; bankName: string; accountNumber: string; accountHolder: string }) =>
    apiClient.post<Transaction>('/api/wallet/withdraw', data).then(r => r.data),

  getTransactions: (params?: { type?: string; status?: string; page?: number }) =>
    apiClient.get<PageResponse<Transaction>>('/api/wallet/transactions', { params }).then(r => r.data),
}