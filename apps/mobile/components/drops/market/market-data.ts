// Presentation metadata for the Market screen (`market.html · market/market-app.jsx`).
//
// Live prices, 24h change and sparklines come from the frontend `prices`
// module (CoinGecko, free, no API key) via `useMarkets`. This file only owns
// the curated bits the API doesn't carry — display name, brand colour and which
// assets to fetch/feature — plus the helpers that merge a live `MarketRate`
// snapshot into the view models the tiles render.

import type { MarketRate } from '@flama/frontend';

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

/** Curated display name + brand colour for an asset, keyed by symbol. */
type MarketMeta = { name: string; color: string };

const MARKET_META: Record<string, MarketMeta> = {
  XRP: { name: 'XRP', color: '#14161a' },
  RLUSD: { name: 'Ripple USD', color: '#0ca678' },
  BTC: { name: 'Bitcoin', color: '#f7931a' },
  ETH: { name: 'Ethereum', color: '#627eea' },
  SOLO: { name: 'Sologenic', color: '#5b41dd' },
  CORE: { name: 'Coreum', color: '#2f6fe0' },
  FLR: { name: 'Flare', color: '#e03131' },
  SGB: { name: 'Songbird', color: '#e8870a' },
  CSC: { name: 'CasinoCoin', color: '#1f8a5b' },
  XLM: { name: 'Stellar', color: '#14b8a6' },
};

/** Assets to fetch live, in the order the all-assets list renders them. */
export const MARKET_SYMBOLS = Object.keys(MARKET_META);

/** Assets shown as full hero cards with a sparkline, in display order. */
export const HERO_SYMBOLS = ['XRP', 'BTC'] as const;

function metaFor(symbol: string): MarketMeta {
  return MARKET_META[symbol] ?? { name: symbol, color: '#14161a' };
}

function toAsset(rate: MarketRate): MarketAsset {
  const meta = metaFor(rate.symbol);
  return {
    symbol: rate.symbol,
    name: meta.name,
    price: rate.price,
    change: rate.change24h,
    color: meta.color,
  };
}

function toMover(rate: MarketRate): MarketMover {
  return {
    symbol: rate.symbol,
    change: rate.change24h,
    color: metaFor(rate.symbol).color,
  };
}

/** Indexes a live snapshot by symbol for quick lookup. */
function bySymbol(markets: MarketRate[]): Map<string, MarketRate> {
  return new Map(markets.map((market) => [market.symbol, market]));
}

/** Builds the featured hero cards from the live snapshot, skipping any missing. */
export function buildHeroes(markets: MarketRate[]): MarketHero[] {
  const index = bySymbol(markets);
  return HERO_SYMBOLS.flatMap((symbol) => {
    const rate = index.get(symbol);
    return rate ? [{ ...toAsset(rate), spark: rate.spark }] : [];
  });
}

/** Builds the all-assets list in the curated `MARKET_SYMBOLS` order. */
export function buildAssetList(markets: MarketRate[]): MarketAsset[] {
  const index = bySymbol(markets);
  return MARKET_SYMBOLS.flatMap((symbol) => {
    const rate = index.get(symbol);
    return rate ? [toAsset(rate)] : [];
  });
}

/** Maps live snapshots (already split into gainers/losers) into mover tiles. */
export function buildMovers(markets: MarketRate[]): MarketMover[] {
  return markets.map(toMover);
}

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
