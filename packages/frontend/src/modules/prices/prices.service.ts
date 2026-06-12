import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IPriceProvider } from './price.provider';
import { PricesErrors } from './prices.errors';
import type { PricesStore } from './prices.state';

/** Default fiat currency used when a caller omits one. */
export const DEFAULT_CURRENCY = 'usd';

function rateKey(symbol: string, currency: string): string {
  return `${symbol.toUpperCase()}:${currency.toLowerCase()}`;
}

@injectable()
export class PricesService {
  constructor(
    @inject(TOKENS.PriceProvider)
    private readonly provider: IPriceProvider,
    @inject(TOKENS.PricesStore)
    public readonly store: PricesStore,
  ) {}

  /**
   * Fetches the spot rate for one unit of `symbol` in `currency`, caches it in
   * the store and returns it. Rejects with RATE_UNAVAILABLE on provider error.
   */
  async getRate(symbol: string, currency = DEFAULT_CURRENCY): Promise<number> {
    let rate: number;
    try {
      rate = await this.provider.getRate(symbol, currency);
    } catch {
      throw new AppError(PricesErrors.RATE_UNAVAILABLE);
    }
    const key = rateKey(symbol, currency);
    this.store.setState((state) => ({
      rates: { ...state.rates, [key]: { rate, updatedAt: Date.now() } },
    }));
    return rate;
  }

  /** Synchronous read of the last cached rate, or null if none is cached. */
  getCachedRate(symbol: string, currency = DEFAULT_CURRENCY): number | null {
    return this.store.getState().rates[rateKey(symbol, currency)]?.rate ?? null;
  }

  /**
   * Converts `amount` units of `symbol` to `currency` using the cached rate.
   * Returns 0 when no rate has been cached yet.
   */
  toFiat(amount: number, symbol: string, currency = DEFAULT_CURRENCY): number {
    const rate = this.getCachedRate(symbol, currency);
    return rate === null ? 0 : amount * rate;
  }
}
