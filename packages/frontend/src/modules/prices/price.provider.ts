/**
 * Fiat exchange-rate source for the prices module. Apps may inject a
 * platform- or vendor-specific implementation via {@link FlamaAppConfig};
 * otherwise the built-in {@link CoinGeckoPriceProvider} is used.
 */
export interface IPriceProvider {
  /** Spot price of one unit of `symbol` (e.g. 'XRP') in `currency` (e.g. 'usd'). */
  getRate(symbol: string, currency: string): Promise<number>;
}

/** Maps an asset symbol to its CoinGecko coin id. */
const COINGECKO_IDS: Record<string, string> = {
  XRP: 'ripple',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  RLUSD: 'ripple-usd',
};

function toCoinGeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] ?? symbol.toLowerCase();
}

/**
 * Default exchange-rate provider backed by the CoinGecko public simple-price
 * API. Uses the global `fetch`; throws a plain Error on transport or parse
 * failure (the service maps it to an AppError).
 */
export class CoinGeckoPriceProvider implements IPriceProvider {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';

  async getRate(symbol: string, currency: string): Promise<number> {
    const id = toCoinGeckoId(symbol);
    const vsCurrency = currency.toLowerCase();
    const url = `${CoinGeckoPriceProvider.BASE_URL}?ids=${id}&vs_currencies=${vsCurrency}`;

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
}
