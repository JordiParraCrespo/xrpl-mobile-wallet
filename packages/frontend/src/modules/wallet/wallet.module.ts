import { type ChainAdapter, ChainRegistry } from '@flama/chain-core';
import { EvmAdapter, XRPL_EVM_TESTNET } from '@flama/chain-evm';
import { XRPL_TESTNET, XrplAdapter } from '@flama/chain-xrpl';
import { KeyringManager } from '@flama/wallet-keyring';
import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import type { IStorageService } from '../core/storage.service';
import { WalletService } from './wallet.service';
import { createWalletStore } from './wallet.state';

const defaultChains = (): ChainAdapter[] => [
  new XrplAdapter(XRPL_TESTNET),
  new EvmAdapter(XRPL_EVM_TESTNET),
];

export function createWalletModule(chains?: ChainAdapter[]): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind(TOKENS.KeyringManager)
      .toDynamicValue(
        (context) => new KeyringManager(context.get<IStorageService>(TOKENS.StorageService)),
      )
      .inSingletonScope();
    bind(TOKENS.ChainRegistry).toConstantValue(new ChainRegistry(chains ?? defaultChains()));
    bind(TOKENS.WalletStore).toConstantValue(createWalletStore());
    bind(TOKENS.WalletService).to(WalletService).inSingletonScope();
  });
}
