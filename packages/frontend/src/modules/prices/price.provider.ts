/**
 * Live market snapshot for one asset: spot price plus 24h change and an
 * optional sparkline series, as returned by {@link IPriceProvider.getMarkets}.
 */
export interface MarketRate {
  /** Asset symbol, uppercased (e.g. 'XRP'). */
  symbol: string;
  /** Spot price of one unit in the requested currency. */
  price: number;
  /** 24h price change in percent (e.g. 2.41 or -0.92). */
  change24h: number;
  /** Recent price series for a sparkline, oldest → newest. May be empty. */
  spark: number[];
}

/**
 * Market-data source for the prices module. Apps may inject a platform- or
 * vendor-specific implementation via {@link FlamaAppConfig}; otherwise the
 * built-in {@link CoinGeckoPriceProvider} is used.
 */
export interface IPriceProvider {
  /** Spot price of one unit of `symbol` (e.g. 'XRP') in `currency` (e.g. 'usd'). */
  getRate(symbol: string, currency: string): Promise<number>;
  /**
   * Batch market snapshot (price + 24h change + sparkline) for several assets
   * in a single request. Symbols with no price source are omitted from the
   * result rather than throwing.
   */
  getMarkets(symbols: string[], currency: string): Promise<MarketRate[]>;
}

/** Maps an asset symbol to its CoinGecko coin id. */
const COINGECKO_IDS: Record<string, string> = {
  XRP: 'ripple',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  RLUSD: 'ripple-usd',
  SOLO: 'sologenic',
  CORE: 'coreum',
  FLR: 'flare-networks',
  SGB: 'songbird',
  CSC: 'casinocoin',
  XLM: 'stellar',
};

function toCoinGeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] ?? symbol.toLowerCase();
}

/** Shape of a single entry in the CoinGecko `/coins/markets` response. */
interface CoinGeckoMarket {
  id: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price?: number[] };
}

/**
 * Default market-data provider backed by the CoinGecko public API. It needs no
 * API key and uses the global `fetch`; it throws a plain Error on transport or
 * parse failure (the service maps it to an AppError).
 */
export class CoinGeckoPriceProvider implements IPriceProvider {
  private static readonly SIMPLE_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';
  private static readonly MARKETS_URL = 'https://api.coingecko.com/api/v3/coins/markets';

  async getRate(symbol: string, currency: string): Promise<number> {
    const id = toCoinGeckoId(symbol);
    const vsCurrency = currency.toLowerCase();
    const url = `${CoinGeckoPriceProvider.SIMPLE_PRICE_URL}?ids=${id}&vs_currencies=${vsCurrency}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko request failed with status ${response.status}`);
    }

    const json = (await response.json()) as Record<string, Record<string, unknown>>;
    const rate = json?.[id]?.[vsCurrency];
    if (typeof rate !== 'number' || !Number.isFinite(rate)) {
      throw new Error(`CoinGecko returned no price for ${id}/${vsCurrency}`);
    }
    return rate;
  }

  async getMarkets(symbols: string[], currency: string): Promise<MarketRate[]> {
    if (symbols.length === 0) {
      return [];
    }

    // Build the id→symbol lookup so results map back to the caller's symbols
    // regardless of CoinGecko's own (sometimes ambiguous) tickers.
    const idToSymbol = new Map<string, string>();
    for (const symbol of symbols) {
      idToSymbol.set(toCoinGeckoId(symbol), symbol.toUpperCase());
    }

    const vsCurrency = currency.toLowerCase();
    const ids = [...idToSymbol.keys()].join(',');
    const url =
      `${CoinGeckoPriceProvider.MARKETS_URL}?vs_currency=${vsCurrency}` +
      `&ids=${ids}&sparkline=true&price_change_percentage=24h`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko request failed with status ${response.status}`);
    }

    const json = (await response.json()) as CoinGeckoMarket[];
    if (!Array.isArray(json)) {
      throw new Error('CoinGecko returned an unexpected markets payload');
    }

    return json
      .filter((item) => Number.isFinite(item?.current_price))
      .map((item) => ({
        symbol: idToSymbol.get(item.id) ?? item.id.toUpperCase(),
        price: item.current_price,
        change24h: Number.isFinite(item.price_change_percentage_24h)
          ? (item.price_change_percentage_24h as number)
          : 0,
        spark: item.sparkline_in_7d?.price ?? [],
      }));
  }
}
