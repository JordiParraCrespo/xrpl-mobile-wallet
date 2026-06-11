import type { ChainErrorCode } from './errors';

export type ChainKind = 'xrpl' | 'evm';

export interface NetworkConfig {
  /** Unique id, e.g. "xrpl:testnet" or "evm:1449000". */
  chainId: string;
  kind: ChainKind;
  name: string;
  rpcUrl: string;
  explorerUrl?: string;
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

/**
 * Read-only chain state needed to build and validate a transaction before
 * signing. An adapter assembles this once (see `XrplAdapter.buildContext`) and
 * hands it to the transaction layer, which builds the canonical tx from it.
 */
export interface TxContext {
  /** The sender's address. */
  account: string;
  /** Current account sequence / nonce. */
  sequence: number;
  /** Current ledger index / block height; used to bound transaction validity. */
  ledgerIndex: number;
  /** Spendable native balance, in base units (drops, wei). */
  balanceDrops: bigint;
  /** Reserve that must remain untouched, in base units. */
  reserveDrops: bigint;
  /** Network fee to apply, in base units. */
  feeDrops: bigint;
}
