// Mocked market data for the Market screen. The real feature will source this
// from the chain/explorer modules + a price oracle; for now these fixtures
// mirror the design's sample data so the screen is fully composed and
// browsable. Keep the shapes stable — the live wiring should be a drop-in.

export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  /** Brand colour for the asset's icon disc. */
  color: string;
};

export type HeroAsset = Asset & {
  /** Sparkline samples, oldest → newest. */
  spark: number[];
};

export type Mover = Pick<Asset, 'symbol' | 'change' | 'color'>;

export const HERO_ASSET: HeroAsset = {
  symbol: 'XRP',
  name: 'XRP',
  price: 0.6184,
  change: 2.41,
  color: '#14161a',
  spark: [10, 9, 11, 10.5, 12, 11.4, 13, 12.6, 14.2, 13.8, 15.6],
};

export const TOP_GAINERS: Mover[] = [
  { symbol: 'SOLO', change: 23.96, color: '#5b41dd' },
  { symbol: 'CORE', change: 16.82, color: '#2f6fe0' },
  { symbol: 'XAH', change: 15.41, color: '#1f8a5b' },
  { symbol: 'CSC', change: 12.41, color: '#e8870a' },
  { symbol: 'ELS', change: 11.07, color: '#d6409f' },
  { symbol: 'FLR', change: 9.96, color: '#e03131' },
];

export const TOP_LOSERS: Mover[] = [
  { symbol: 'SGB', change: -6.2, color: '#e8870a' },
  { symbol: 'EVR', change: -3.84, color: '#2f6fe0' },
  { symbol: 'TPR', change: -2.77, color: '#1f8a5b' },
  { symbol: 'ABA', change: -2.1, color: '#d6409f' },
  { symbol: 'CSC', change: -1.62, color: '#e8870a' },
  { symbol: 'XAH', change: -0.94, color: '#5b41dd' },
];

export const ALL_ASSETS: Asset[] = [
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

// Prices under $1 want more precision; everything else two decimals.
export function formatPrice(value: number): string {
  const decimals = value < 1 ? 4 : 2;
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
