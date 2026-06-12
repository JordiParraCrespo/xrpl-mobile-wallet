'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { MarketRate } from '../modules/prices';
import { useFlamaApp } from './context';

export const pricesKeys = {
  all: ['prices'] as const,
  rate: (symbol: string, currency: string) => ['prices', 'rate', symbol, currency] as const,
  markets: (symbols: string[], currency: string) =>
    ['prices', 'markets', currency, ...symbols] as const,
};

/** Fetches the spot exchange rate for one unit of `symbol` in `currency`. */
export function useExchangeRate(
  symbol: string,
  currency?: string,
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: pricesKeys.rate(symbol, currency ?? 'usd'),
    queryFn: () => app.prices.getRate(symbol, currency),
    staleTime: 60_000,
    ...options,
  });
}

/**
 * Fetches a live market snapshot (price + 24h change + sparkline) for several
 * assets in one request. Powers the market screen; refetches keep prices fresh.
 */
export function useMarkets(
  symbols: string[],
  currency?: string,
  options?: Omit<UseQueryOptions<MarketRate[], Error>, 'queryKey' | 'queryFn'>,
) {
  const app = useFlamaApp();

  return useQuery({
    queryKey: pricesKeys.markets(symbols, currency ?? 'usd'),
    queryFn: () => app.prices.getMarkets(symbols, currency),
    staleTime: 60_000,
    ...options,
  });
}
