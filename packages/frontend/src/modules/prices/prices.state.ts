import { createStore } from 'zustand/vanilla';

export interface CachedRate {
  rate: number;
  /** Millisecond epoch at which the rate was last fetched. */
  updatedAt: number;
}

export interface PricesState {
  /** Keyed by `${SYMBOL}:${currency}` (symbol uppercased, currency lowercased). */
  rates: Record<string, CachedRate>;
}

export type PricesStore = ReturnType<typeof createPricesStore>;

export const createPricesStore = () =>
  createStore<PricesState>(() => ({
    rates: {},
  }));
