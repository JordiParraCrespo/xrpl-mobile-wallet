import type { NetworkConfig } from '@flama/chain-core';

export const XRPL_EVM_TESTNET: NetworkConfig = {
  chainId: 'evm:1449000',
  kind: 'evm',
  name: 'XRPL EVM Testnet',
  rpcUrl: 'https://rpc.testnet.xrplevm.org',
  explorerUrl: 'https://explorer.testnet.xrplevm.org',
  nativeCurrency: { symbol: 'XRP', decimals: 18 },
};

export const XRPL_EVM_MAINNET: NetworkConfig = {
  chainId: 'evm:1440000',
  kind: 'evm',
  name: 'XRPL EVM',
  rpcUrl: 'https://rpc.xrplevm.org',
  explorerUrl: 'https://explorer.xrplevm.org',
  nativeCurrency: { symbol: 'XRP', decimals: 18 },
};
