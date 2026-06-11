import { createStore } from 'zustand/vanilla';

export type SecurityStatus = 'unknown' | 'uninitialized' | 'locked' | 'unlocked';

export interface SecurityState {
  /** 'unknown' until restore() has run. */
  status: SecurityStatus;
  biometricsAvailable: boolean;
  biometricsEnabled: boolean;
  failedAttempts: number;
  /** Millisecond epoch until which passcode unlock is locked out, or null. */
  lockoutUntil: number | null;
}

export type SecurityStore = ReturnType<typeof createSecurityStore>;

export const createSecurityStore = () =>
  createStore<SecurityState>(() => ({
    status: 'unknown',
    biometricsAvailable: false,
    biometricsEnabled: false,
    failedAttempts: 0,
    lockoutUntil: null,
  }));
