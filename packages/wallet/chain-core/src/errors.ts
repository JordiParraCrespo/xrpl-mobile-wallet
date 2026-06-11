/**
 * Reusable, chain-agnostic error layer shared by every chain adapter.
 *
 * Adapters translate chain-native failures (XRPL engine result codes, EVM
 * reverts, RPC/HTTP transport errors) into a {@link ChainError} carrying one of
 * the common {@link ChainErrors} codes below. Consumers can branch on
 * `error.code` without knowing which chain produced it — the same shape the
 * app-level `AppError` catalogs use (`{ code, message }`), so a `ChainError`
 * drops straight into existing error handling.
 */

export interface ChainErrorDefinition {
  readonly code: string;
  readonly message: string;
}

/**
 * Common error catalog, shared across all chains. Each adapter maps its native
 * failure codes onto one of these so the rest of the app sees a stable set.
 */
export const ChainErrors = {
  NETWORK: {
    code: 'CHAIN_001',
    message: 'Could not reach the network',
  },
  RPC: {
    code: 'CHAIN_002',
    message: 'The node rejected the request',
  },
  ACCOUNT_NOT_FOUND: {
    code: 'CHAIN_003',
    message: 'Account not found on the ledger',
  },
  INSUFFICIENT_FUNDS: {
    code: 'CHAIN_004',
    message: 'Insufficient funds for this transaction',
  },
  INVALID_TRANSACTION: {
    code: 'CHAIN_005',
    message: 'The transaction is malformed or invalid',
  },
  TRANSACTION_REJECTED: {
    code: 'CHAIN_006',
    message: 'The network rejected the transaction',
  },
  TRANSACTION_FAILED: {
    code: 'CHAIN_007',
    message: 'The transaction failed on chain',
  },
  TRANSACTION_EXPIRED: {
    code: 'CHAIN_008',
    message: 'The transaction expired before it was validated',
  },
  SIGNING_FAILED: {
    code: 'CHAIN_009',
    message: 'Could not sign the transaction',
  },
  UNKNOWN: {
    code: 'CHAIN_999',
    message: 'An unexpected chain error occurred',
  },
} as const satisfies Record<string, ChainErrorDefinition>;

/** A single entry of the common catalog (preserves literal `code`). */
export type ChainErrorEntry = (typeof ChainErrors)[keyof typeof ChainErrors];

/** Union of every common error code, e.g. `'CHAIN_001' | 'CHAIN_002' | ...`. */
export type ChainErrorCode = ChainErrorEntry['code'];

export interface ChainErrorContext {
  /** Chain that raised the error, e.g. `"xrpl:testnet"`. */
  chainId?: string;
  /** Chain-native code/message, e.g. `"tecUNFUNDED_PAYMENT"` or a revert string. */
  detail?: string;
  /** Underlying error, preserved for debugging. */
  cause?: unknown;
}

/**
 * Chain failure with a common, chain-agnostic {@link ChainErrorCode}. Keeps the
 * original chain-native code in `detail` and the underlying error in `cause`.
 */
export class ChainError extends Error {
  readonly code: ChainErrorCode;
  readonly chainId?: string;
  readonly detail?: string;

  constructor(definition: ChainErrorEntry, context: ChainErrorContext = {}) {
    super(definition.message, context.cause !== undefined ? { cause: context.cause } : undefined);
    this.name = 'ChainError';
    this.code = definition.code;
    this.chainId = context.chainId;
    this.detail = context.detail;
  }
}

/**
 * Normalizes any thrown value into a {@link ChainError}. Adapters call this in
 * catch blocks so a stray RPC/library error never escapes as an opaque `Error`.
 * Already-mapped `ChainError`s pass through unchanged.
 */
export function toChainError(error: unknown, chainId?: string): ChainError {
  if (error instanceof ChainError) {
    return error;
  }
  return new ChainError(ChainErrors.UNKNOWN, {
    chainId,
    detail: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}
