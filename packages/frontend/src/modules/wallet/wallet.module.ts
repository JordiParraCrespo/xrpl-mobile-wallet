import { KeyringManager } from '@flama/wallet-keyring';
import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import type { IStorageService } from '../core/storage.service';
import { WalletService } from './wallet.service';
import { createWalletStore } from './wallet.state';

export const WalletModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.KeyringManager)
    .toDynamicValue(
      (context) => new KeyringManager(context.get<IStorageService>(TOKENS.StorageService)),
    )
    .inSingletonScope();
  bind(TOKENS.WalletStore).toConstantValue(createWalletStore());
  bind(TOKENS.WalletService).to(WalletService).inSingletonScope();
});
