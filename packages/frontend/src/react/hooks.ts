'use client';
import { useStore } from 'zustand';
import type { AddressBookState } from '../modules/address-book/address-book.state';
import type { AuthState } from '../modules/auth/auth.state';
import type { ProfileState } from '../modules/profile/profile.state';
import type { SecurityState } from '../modules/security/security.state';
import type { SettingsState } from '../modules/settings/settings.state';
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

export function useProfileState(): ProfileState {
  const profile = useFlamaApp().profile;
  return useStore(profile.store);
}

export function useSettingsState(): SettingsState {
  const settings = useFlamaApp().settings;
  return useStore(settings.store);
}

export function useAddressBookState(): AddressBookState {
  const addressBook = useFlamaApp().addressBook;
  return useStore(addressBook.store);
}
