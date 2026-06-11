import type { NetworkConfig } from '@flama/chain-core';

export const XRPL_TESTNET: NetworkConfig = {
  chainId: 'xrpl:testnet',
  kind: 'xrpl',
  name: 'XRPL Testnet',
  rpcUrl: 'https://s.altnet.rippletest.net:51234',
  explorerUrl: 'https://testnet.xrpl.org',
  faucetUrl: 'https://faucet.altnet.rippletest.net/accounts',
  nativeCurrency: { symbol: 'XRP', decimals: 6 },
};

export const XRPL_MAINNET: NetworkConfig = {
  chainId: 'xrpl:mainnet',
  kind: 'xrpl',
  name: 'XRPL Mainnet',
  rpcUrl: 'https://xrplcluster.com',
  explorerUrl: 'https://livenet.xrpl.org',
  nativeCurrency: { symbol: 'XRP', decimals: 6 },
};
