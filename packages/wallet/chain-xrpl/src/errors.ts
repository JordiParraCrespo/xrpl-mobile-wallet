import { ChainError, type ChainErrorEntry, ChainErrors } from '@flama/chain-core';

/**
 * XRPL engine result codes that mean the account or payment lacks the funds /
 * reserve required. These span the `tec`/`ter`/`tel` classes, so they are
 * matched explicitly before the prefix-based fallbacks below.
 */
const INSUFFICIENT_FUNDS_CODES = new Set([
  'tecUNFUNDED',
  'tecUNFUNDED_PAYMENT',
  'tecINSUFFICIENT_RESERVE',
  'tecINSUF_RESERVE_LINE',
  'tecINSUF_RESERVE_OFFER',
  'tecNO_LINE_INSUF_RESERVE',
  'terINSUF_FEE_B',
  'telINSUF_FEE_P',
]);

/**
 * Maps an XRPL result code (`engine_result` on submit, or
 * `meta.TransactionResult` once validated) to a common error entry.
 *
 * Class prefixes: `tem` malformed, `tef`/`tel`/`ter` rejected/retried by the
 * node, `tec` claimed-fee failures applied on chain.
 */
export function xrplResultToError(code: string): ChainErrorEntry {
  if (INSUFFICIENT_FUNDS_CODES.has(code)) {
    return ChainErrors.INSUFFICIENT_FUNDS;
  }
  if (code.startsWith('tem')) {
    return ChainErrors.INVALID_TRANSACTION;
  }
  if (code.startsWith('tef') || code.startsWith('tel') || code.startsWith('ter')) {
    return ChainErrors.TRANSACTION_REJECTED;
  }
  // tec and anything unrecognized: applied to the ledger but failed.
  return ChainErrors.TRANSACTION_FAILED;
}

/**
 * Maps an XRPL JSON-RPC `error` field (returned inside a 200 response) to a
 * common {@link ChainError}.
 */
export function xrplRpcError(
  error: string,
  message: string | undefined,
  chainId: string,
): ChainError {
  if (error === 'actNotFound') {
    return new ChainError(ChainErrors.ACCOUNT_NOT_FOUND, {
      chainId,
      detail: error,
    });
  }
  return new ChainError(ChainErrors.RPC, { chainId, detail: message ?? error });
}
