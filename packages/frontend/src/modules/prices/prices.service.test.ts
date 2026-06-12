import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../core/errors';
import { CoinGeckoPriceProvider, type IPriceProvider } from './price.provider';
import { PricesErrors } from './prices.errors';
import { DEFAULT_CURRENCY, PricesService } from './prices.service';
import { createPricesStore, type PricesStore } from './prices.state';

/** Scriptable price provider: returns a number or throws. */
class FakePriceProvider implements IPriceProvider {
  calls: Array<{ symbol: string; currency: string }> = [];
  result: number | Error = 1;

  getRate(symbol: string, currency: string): Promise<number> {
    this.calls.push({ symbol, currency });
    if (this.result instanceof Error) {
      return Promise.reject(this.result);
    }
    return Promise.resolve(this.result);
  }
}

async function expectAppError(promise: Promise<unknown>, code: string): Promise<void> {
  await expect(promise).rejects.toSatisfy(
    (error) => error instanceof AppError && error.code === code,
  );
}

describe('PricesService', () => {
  let provider: FakePriceProvider;
  let store: PricesStore;
  let service: PricesService;

  beforeEach(() => {
    provider = new FakePriceProvider();
    store = createPricesStore();
    service = new PricesService(provider, store);
  });

  describe('getRate', () => {
    it('returns the provider rate and caches it', async () => {
      provider.result = 0.5;
      const rate = await service.getRate('XRP', 'usd');
      expect(rate).toBe(0.5);
      expect(store.getState().rates['XRP:usd'].rate).toBe(0.5);
      expect(service.getCachedRate('XRP', 'usd')).toBe(0.5);
    });

    it('records updatedAt as a positive timestamp', async () => {
      provider.result = 1.23;
      await service.getRate('XRP', 'usd');
      expect(store.getState().rates['XRP:usd'].updatedAt).toBeTypeOf('number');
      expect(store.getState().rates['XRP:usd'].updatedAt).toBeGreaterThan(0);
    });

    it('normalizes mixed-case symbol and currency into the cache key', async () => {
      provider.result = 2;
      await service.getRate('xRp', 'USD');
      expect(store.getState().rates['XRP:usd'].rate).toBe(2);
      // Case-insensitive read.
      expect(service.getCachedRate('XRP', 'usd')).toBe(2);
      expect(service.getCachedRate('xrp', 'Usd')).toBe(2);
    });

    it('defaults the currency to usd', async () => {
      provider.result = 3;
      await service.getRate('XRP');
      expect(provider.calls[0]).toEqual({
        symbol: 'XRP',
        currency: DEFAULT_CURRENCY,
      });
      expect(store.getState().rates['XRP:usd'].rate).toBe(3);
    });

    it('maps a provider failure to RATE_UNAVAILABLE', async () => {
      provider.result = new Error('network down');
      await expectAppError(service.getRate('XRP', 'usd'), PricesErrors.RATE_UNAVAILABLE.code);
    });
  });

  describe('getCachedRate', () => {
    it('returns null when no rate is cached', () => {
      expect(service.getCachedRate('XRP', 'usd')).toBeNull();
    });
  });

  describe('toFiat', () => {
    it('multiplies the amount by the cached rate', async () => {
      provider.result = 0.5;
      await service.getRate('XRP', 'usd');
      expect(service.toFiat(10, 'XRP', 'usd')).toBe(5);
    });

    it('returns 0 when no rate is cached', () => {
      expect(service.toFiat(10, 'XRP', 'usd')).toBe(0);
    });

    it('defaults the currency to usd', async () => {
      provider.result = 2;
      await service.getRate('XRP');
      expect(service.toFiat(4, 'XRP')).toBe(8);
    });
  });
});

describe('CoinGeckoPriceProvider', () => {
  const provider = new CoinGeckoPriceProvider();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the correct URL and parses the nested rate', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ripple: { usd: 0.62 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const rate = await provider.getRate('XRP', 'usd');
    expect(rate).toBe(0.62);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd',
    );
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(provider.getRate('XRP', 'usd')).rejects.toThrow();
  });

  it('throws when no numeric price is present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ripple: {} }),
      }),
    );
    await expect(provider.getRate('XRP', 'usd')).rejects.toThrow();
  });
});
