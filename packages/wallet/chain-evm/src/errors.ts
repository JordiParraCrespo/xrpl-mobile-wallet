import { ChainError, ChainErrors, toChainError } from '@flama/chain-core';
import {
  BaseError,
  HttpRequestError,
  InsufficientFundsError,
  TimeoutError,
  TransactionExecutionError,
} from 'viem';

/**
 * Maps a viem error onto a common {@link ChainError}. viem wraps the root cause
 * in a `BaseError` chain, so we walk it to find the most specific match before
 * falling back to a generic RPC error.
 */
export function mapEvmError(error: unknown, chainId: string): ChainError {
  if (error instanceof BaseError) {
    const detail = error.shortMessage;
    if (error.walk((e) => e instanceof InsufficientFundsError)) {
      return new ChainError(ChainErrors.INSUFFICIENT_FUNDS, {
        chainId,
        detail,
        cause: error,
      });
    }
    if (error.walk((e) => e instanceof HttpRequestError || e instanceof TimeoutError)) {
      return new ChainError(ChainErrors.NETWORK, {
        chainId,
        detail,
        cause: error,
      });
    }
    if (error.walk((e) => e instanceof TransactionExecutionError)) {
      return new ChainError(ChainErrors.TRANSACTION_REJECTED, {
        chainId,
        detail,
        cause: error,
      });
    }
    return new ChainError(ChainErrors.RPC, { chainId, detail, cause: error });
  }
  return toChainError(error, chainId);
}
