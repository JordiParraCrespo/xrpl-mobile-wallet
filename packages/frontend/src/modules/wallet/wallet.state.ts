import type { ChainKind } from '@flama/chain-core';
import type { WalletType } from '@flama/wallet-keyring';
import { createStore } from 'zustand/vanilla';

/** Keyring wallet metadata exposed to the UI (no key material). */
export interface WalletInfo {
  id: string;
  name: string;
  type: WalletType;
  /** Chain kinds this wallet can derive accounts for. */
  chains: ChainKind[];
  backedUp: boolean;
}

export interface WalletAccount {
  chainId: string;
  kind: ChainKind;
  chainName: string;
  symbol: string;
  address: string;
}

export interface WalletState {
  /** 'idle' until restore() has run. */
  status: 'idle' | 'no_wallet' | 'locked' | 'ready';
  wallets: WalletInfo[];
  activeWalletId: string | null;
  /** Accounts for the ACTIVE wallet, only on the chains it supports. */
  accounts: WalletAccount[];
}

export type WalletStore = ReturnType<typeof createWalletStore>;

export const createWalletStore = () =>
  createStore<WalletState>(() => ({
    status: 'idle',
    wallets: [],
    activeWalletId: null,
    accounts: [],
  }));
