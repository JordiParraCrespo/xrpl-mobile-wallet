import type { ErrorDefinition } from '../core/errors';

export const PricesErrors = {
  RATE_UNAVAILABLE: {
    code: 'PRICES_CLIENT_001',
    message: 'Could not fetch the exchange rate',
  },
  UNKNOWN_SYMBOL: {
    code: 'PRICES_CLIENT_002',
    message: 'No price source for this asset',
  },
} as const satisfies Record<string, ErrorDefinition>;
