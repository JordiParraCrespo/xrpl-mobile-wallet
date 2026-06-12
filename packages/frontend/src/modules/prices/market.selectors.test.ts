import { describe, expect, it } from 'vitest';
import { splitMovers } from './market.selectors';
import type { MarketRate } from './price.provider';

function rate(symbol: string, change24h: number): MarketRate {
  return { symbol, price: 1, change24h, spark: [] };
}

describe('splitMovers', () => {
  it('orders gainers best-first and losers worst-first', () => {
    const markets = [rate('A', 5), rate('B', -2), rate('C', 12), rate('D', -8), rate('E', 0)];
    const { gainers, losers } = splitMovers(markets);
    expect(gainers.map((m) => m.symbol)).toEqual(['C', 'A']);
    expect(losers.map((m) => m.symbol)).toEqual(['D', 'B']);
  });

  it('excludes flat (zero-change) assets from both lists', () => {
    const { gainers, losers } = splitMovers([rate('A', 0), rate('B', 0)]);
    expect(gainers).toEqual([]);
    expect(losers).toEqual([]);
  });

  it('caps each list at the requested count', () => {
    const markets = [rate('A', 3), rate('B', 2), rate('C', 1), rate('D', 4)];
    const { gainers } = splitMovers(markets, 2);
    expect(gainers.map((m) => m.symbol)).toEqual(['D', 'A']);
  });

  it('does not mutate the input array', () => {
    const markets = [rate('A', 1), rate('B', 5)];
    const snapshot = [...markets];
    splitMovers(markets);
    expect(markets).toEqual(snapshot);
  });
});
