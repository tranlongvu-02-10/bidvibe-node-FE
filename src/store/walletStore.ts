import { create } from 'zustand'
import type { Wallet } from '../types'

interface WalletState {
  wallet: Wallet | null
  setWallet: (wallet: Wallet | null) => void
  updateBalance: (available: number, locked: number) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  setWallet:     (wallet) => set({ wallet }),
  updateBalance: (available, locked) =>
    set({ wallet: { balanceAvailable: available, balanceLocked: locked } }),
}))