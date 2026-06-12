// Static market data for the Market screen (`market.html · market/market-app.jsx`).
// XRPL-ecosystem prices, top movers and the all-assets list — mock figures the
// design ships with, kept here so the screen and its tiles share one source.

export type MarketAsset = {
  symbol: string;
  name: string;
  /** Last price in USD. */
  price: number;
  /** 24h percent change, e.g. 2.41 or -0.92. */
  change: number;
  /** Brand colour for the asset disc. */
  color: string;
};

/** A compact top-mover tile: symbol + change only. */
export type MarketMover = Pick<MarketAsset, 'symbol' | 'change' | 'color'>;

/** A hero asset carries a sparkline series alongside its price. */
export type MarketHero = MarketAsset & { spark: number[] };

export const MARKET_HEROES: MarketHero[] = [
  {
    symbol: 'XRP',
    name: 'XRP',
    price: 0.6184,
    change: 2.41,
    color: '#14161a',
    spark: [10, 9, 11, 10.5, 12, 11.4, 13, 12.6, 14.2, 13.8, 15.6],
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 61240.5,
    change: -0.92,
    color: '#f7931a',
    spark: [16, 15.2, 15.6, 14.2, 14.8, 13.4, 13.9, 12.6, 13.2, 12.1, 11.7],
  },
];

export const MARKET_GAINERS: MarketMover[] = [
  { symbol: 'SOLO', change: 23.96, color: '#5b41dd' },
  { symbol: 'CORE', change: 16.82, color: '#2f6fe0' },
  { symbol: 'XAH', change: 15.41, color: '#1f8a5b' },
  { symbol: 'CSC', change: 12.41, color: '#e8870a' },
  { symbol: 'ELS', change: 11.07, color: '#d6409f' },
  { symbol: 'FLR', change: 9.96, color: '#e03131' },
];

export const MARKET_LOSERS: MarketMover[] = [
  { symbol: 'SGB', change: -6.2, color: '#e8870a' },
  { symbol: 'EVR', change: -3.84, color: '#2f6fe0' },
  { symbol: 'TPR', change: -2.77, color: '#1f8a5b' },
  { symbol: 'ABA', change: -2.1, color: '#d6409f' },
  { symbol: 'CSC', change: -1.62, color: '#e8870a' },
  { symbol: 'XAH', change: -0.94, color: '#5b41dd' },
];

export const MARKET_ALL_ASSETS: MarketAsset[] = [
  { symbol: 'XRP', name: 'XRP', price: 0.6184, change: 2.41, color: '#14161a' },
  {
    symbol: 'RLUSD',
    name: 'Ripple USD',
    price: 1.0008,
    change: 0.01,
    color: '#0ca678',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 61240.5,
    change: -0.92,
    color: '#f7931a',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2410.33,
    change: -0.91,
    color: '#627eea',
  },
  {
    symbol: 'SOLO',
    name: 'Sologenic',
    price: 0.214,
    change: 23.96,
    color: '#5b41dd',
  },
  {
    symbol: 'CORE',
    name: 'Coreum',
    price: 0.083,
    change: 16.82,
    color: '#2f6fe0',
  },
];

/**
 * Format a USD price the way the design does: sub-dollar assets show 4
 * decimals, everything else 2, with thousands separators. Hand-rolled so it
 * doesn't depend on Intl being present in the JS engine.
 */
export function formatPrice(value: number): string {
  const decimals = value < 1 ? 4 : 2;
  const [whole, fraction] = value.toFixed(decimals).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${grouped}.${fraction}`;
}
