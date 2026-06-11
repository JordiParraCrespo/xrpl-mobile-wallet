'use client';
import { useStore } from 'zustand';
import type { AuthState } from '../modules/auth/auth.state';
import type { SecurityState } from '../modules/security/security.state';
import type { WalletState } from '../modules/wallet/wallet.state';
import { useFlamaApp } from './context';

export function useAuthState(): AuthState {
  const auth = useFlamaApp().auth;
  return useStore(auth.store);
}

export function useWalletState(): WalletState {
  const wallet = useFlamaApp().wallet;
  return useStore(wallet.store);
}

export function useSecurityState(): SecurityState {
  const security = useFlamaApp().security;
  return useStore(security.store);
}
