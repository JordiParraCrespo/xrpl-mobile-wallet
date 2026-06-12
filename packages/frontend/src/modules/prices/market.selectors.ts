import type { MarketRate } from './price.provider';

export interface MarketMovers {
  /** Up to `count` assets with the largest positive 24h change, best first. */
  gainers: MarketRate[];
  /** Up to `count` assets with the largest negative 24h change, worst first. */
  losers: MarketRate[];
}

/**
 * Splits a set of live market snapshots into top gainers and losers by 24h
 * change. Pure and side-effect free so the UI can derive movers from a single
 * fetched set. Gainers keep only positive changes; losers only negative.
 */
export function splitMovers(markets: MarketRate[], count = 6): MarketMovers {
  const sorted = [...markets].sort((a, b) => b.change24h - a.change24h);
  const gainers = sorted.filter((market) => market.change24h > 0).slice(0, count);
  const losers = sorted
    .filter((market) => market.change24h < 0)
    .slice(-count)
    .reverse();
  return { gainers, losers };
}
