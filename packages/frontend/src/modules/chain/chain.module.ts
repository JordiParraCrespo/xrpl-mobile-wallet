import { type ChainAdapter, ChainRegistry } from '@flama/chain-core';
import { EvmAdapter, XRPL_EVM_TESTNET } from '@flama/chain-evm';
import { XRPL_TESTNET, XrplAdapter } from '@flama/chain-xrpl';
import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';

const defaultChains = (): ChainAdapter[] => [
  new XrplAdapter(XRPL_TESTNET),
  new EvmAdapter(XRPL_EVM_TESTNET),
];

/**
 * Binds the shared {@link ChainRegistry} — the set of configured chain
 * adapters. This is chain infrastructure consumed by feature modules (wallet
 * for accounts/balance/send, explorer for ledger data), not owned by any one
 * of them. Defaults to XRPL + XRPL EVM testnets.
 */
export function createChainModule(chains?: ChainAdapter[]): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind(TOKENS.ChainRegistry).toConstantValue(new ChainRegistry(chains ?? defaultChains()));
  });
}
