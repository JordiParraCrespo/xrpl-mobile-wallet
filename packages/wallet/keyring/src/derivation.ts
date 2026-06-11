import type { ChainKind } from '@flama/chain-core';

/**
 * BIP-44 derivation paths per chain kind for a given account index.
 * XRPL hardens the account level (Ledger convention; equals the xrpl.js
 * default path at index 0). EVM uses the MetaMask-compatible path.
 */
export function derivationPath(kind: ChainKind, accountIndex: number): string {
  switch (kind) {
    case 'xrpl':
      return `m/44'/144'/${accountIndex}'/0/0`;
    case 'evm':
      return `m/44'/60'/0'/0/${accountIndex}`;
  }
}
