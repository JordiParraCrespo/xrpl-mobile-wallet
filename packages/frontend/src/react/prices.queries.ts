'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useFlamaApp } from './context';

export const pricesKeys = {
  all: ['prices'] as const,
  rate: (symbol: string, currency: string) => ['prices', 'rate', symbol, currency] as const,
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
