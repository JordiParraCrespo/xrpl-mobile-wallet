import type { ChainErrorCode } from './errors';

export type ChainKind = 'xrpl' | 'evm';

export interface NetworkConfig {
  /** Unique id, e.g. "xrpl:testnet" or "evm:1449000". */
  chainId: string;
  kind: ChainKind;
  name: string;
  rpcUrl: string;
  explorerUrl?: string;
  /**
   * Indexed history endpoint, when the chain needs one to list an account's
   * past transactions. XRPL serves history from its own RPC, so it omits this;
   * EVM has no native account-history RPC and points here at a block explorer
   * REST API (e.g. Blockscout's `/api`).
   */
  explorerApiUrl?: string;
  /** Test-network faucet endpoint, when the chain has one. */
  faucetUrl?: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
  /**
   * Curated list of non-native tokens to surface for this network. XRPL
   * enumerates the account's trustlines on chain, so this is only consulted by
   * chains (EVM) that cannot enumerate held tokens without an indexer.
   */
  tokens?: TokenInfo[];
}

export interface Balance {
  symbol: string;
  decimals: number;
  /** Amount in base units (drops, wei). */
  amount: bigint;
  formatted: string;
}

export interface TransferParams {
  from: string;
  to: string;
  /** Amount in base units (drops, wei). */
  amount: bigint;
}

/**
 * A non-native fungible token: an XRPL issued currency (trustline) or an EVM
 * ERC-20. `issuer` is the on-chain locator — the issuer's classic address on
 * XRPL, the contract address on EVM — and together with `symbol` uniquely
 * identifies the token on its chain.
 */
export interface TokenInfo {
  /** Display ticker: XRPL currency code or ERC-20 symbol. */
  symbol: string;
  /** Issuer's classic address (XRPL) or ERC-20 contract address (EVM). */
  issuer: string;
  decimals: number;
  /** Human-readable name when the chain exposes one. */
  name?: string;
}

export interface TokenBalance extends TokenInfo {
  /** Held amount in base units (10^decimals). */
  amount: bigint;
  formatted: string;
}

export interface TokenTransferParams {
  from: string;
  to: string;
  token: TokenInfo;
  /** Amount in the token's base units (10^token.decimals). */
  amount: bigint;
}

/**
 * Authorizes an account to hold a token. On XRPL this opens a trustline to the
 * issuer (required before an issued currency can be received); chains that need
 * no such step do not implement it.
 */
export interface RegisterTokenParams {
  /** Account establishing the authorization. */
  from: string;
  token: TokenInfo;
  /**
   * Maximum amount the account is willing to hold, as a human-readable decimal
   * string. Defaults to a large limit; "0" removes the authorization.
   */
  limit?: string;
}

export interface TxResult {
  hash: string;
  success: boolean;
  /** Chain-native failure code/message when success is false. */
  error?: string;
  /** Common, chain-agnostic failure code when success is false. */
  code?: ChainErrorCode;
  explorerUrl?: string;
}

/** A validated block (EVM) or ledger (XRPL), normalized across chains. */
export interface Block {
  /** Block height / ledger index. */
  height: number;
  hash: string;
  /** Close time in unix seconds. */
  timestamp: number;
  /** Number of transactions included in the block. */
  transactionCount: number;
}

/** Direction of a transaction relative to the queried account. */
export type TxDirection = 'in' | 'out' | 'self';

/** What a historical transaction did, normalized across chains. */
export type LedgerTxKind = 'payment' | 'token-payment' | 'trustset' | 'other';

/**
 * A past transaction touching an account, normalized across chains for the
 * activity feed. Amounts are in the relevant base units (native: drops/wei;
 * token-payment: the token's base units).
 */
export interface LedgerTransaction {
  hash: string;
  /** Inclusion/validation time in unix seconds. */
  timestamp: number;
  kind: LedgerTxKind;
  /** Direction relative to the queried address. */
  direction: TxDirection;
  /** Whether the transaction succeeded on chain. */
  success: boolean;
  /** Value moved, in base units. Zero for transactions that move no value. */
  amount: bigint;
  /** Ticker of the moved asset (native symbol, or the token's symbol). */
  symbol: string;
  /** The other party: recipient for 'out', sender for 'in'. */
  counterparty?: string;
  /** Network fee paid, in native base units (present on the payer's side). */
  fee?: bigint;
  explorerUrl?: string;
}

/** Pagination request for an account's transaction history. */
export interface AccountTxQuery {
  /** Max transactions to return (chains may cap this). */
  limit?: number;
  /**
   * Opaque cursor from a previous page's `nextCursor`. Chain-specific under the
   * hood (XRPL ledger marker, EVM page token); callers treat it as opaque.
   */
  cursor?: string;
}

/** One page of account history, newest first. */
export interface AccountTxPage {
  transactions: LedgerTransaction[];
  /** Cursor for the next (older) page; undefined when history is exhausted. */
  nextCursor?: string;
}
