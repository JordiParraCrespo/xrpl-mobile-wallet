export type ChainKind = 'xrpl' | 'evm';

export interface NetworkConfig {
  /** Unique id, e.g. "xrpl:testnet" or "evm:1449000". */
  chainId: string;
  kind: ChainKind;
  name: string;
  rpcUrl: string;
  explorerUrl?: string;
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
  /** Chain-specific failure code when success is false. */
  error?: string;
  explorerUrl?: string;
}
