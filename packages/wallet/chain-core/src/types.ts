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
