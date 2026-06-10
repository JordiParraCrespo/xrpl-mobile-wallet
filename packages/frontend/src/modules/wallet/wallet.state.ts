import type { ChainKind } from '@flama/chain-core';
import { createStore } from 'zustand/vanilla';

export interface WalletAccount {
  chainId: string;
  kind: ChainKind;
  chainName: string;
  symbol: string;
  address: string;
}

export interface WalletState {
  /** 'idle' until restore() has run. */
  status: 'idle' | 'no_wallet' | 'ready';
  accounts: WalletAccount[];
}

export type WalletStore = ReturnType<typeof createWalletStore>;

export const createWalletStore = () =>
  createStore<WalletState>(() => ({
    status: 'idle',
    accounts: [],
  }));
