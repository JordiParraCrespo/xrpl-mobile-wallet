import 'reflect-metadata';
import type { ChainAdapter } from '@flama/chain-core';
import { Container, type ContainerModule } from 'inversify';
import type { AddressBookService } from '../modules/address-book';
import { AddressBookModule } from '../modules/address-book';
import type { AuthService } from '../modules/auth';
import { AuthModule } from '../modules/auth';
import type { IAuthClient } from '../modules/auth/auth.client';
import { createChainModule } from '../modules/chain';
import { createCoreModule } from '../modules/core/core.module';
import type { IStorageService } from '../modules/core/storage.service';
import type { ExplorerService } from '../modules/explorer';
import { ExplorerModule } from '../modules/explorer';
import type { IPriceProvider, PricesService } from '../modules/prices';
import { createPricesModule } from '../modules/prices';
import type { ProfileService } from '../modules/profile';
import { ProfileModule } from '../modules/profile';
import type { IBiometricProvider, SecurityService } from '../modules/security';
import { createSecurityModule } from '../modules/security';
import type { TokensService } from '../modules/tokens';
import { TokensModule } from '../modules/tokens';
import type { UsersService } from '../modules/users';
import { UsersModule } from '../modules/users';
import type { WalletService } from '../modules/wallet';
import { WalletModule } from '../modules/wallet';
import { TOKENS } from './tokens';

export interface FlamaAppConfig {
  apiBaseUrl: string;
  storage: IStorageService;
  /** Platform-specific Better Auth client adapter. */
  authClient: IAuthClient;
  /**
   * Platform biometric authenticator (Face ID / fingerprint) used by the
   * security module for biometric unlock. Omit to disable biometrics.
   */
  biometricProvider?: IBiometricProvider;
  /**
   * Fiat exchange-rate source for the prices module. Omit to use the built-in
   * CoinGecko provider.
   */
  priceProvider?: IPriceProvider;
  /** Chain adapters for the wallet. Defaults to XRPL + XRPL EVM testnets. */
  chains?: ChainAdapter[];
  modules?: ContainerModule[];
}

export class FlamaApp {
  private constructor(public readonly container: Container) {}

  static create(config: FlamaAppConfig): FlamaApp {
    const container = new Container();

    // Core: storage + API client
    container.load(createCoreModule(config));

    // Chain infrastructure (shared registry of chain adapters)
    container.load(createChainModule(config.chains));

    // Feature modules
    container.load(AuthModule);
    container.load(UsersModule);
    container.load(ProfileModule);
    container.load(WalletModule);
    container.load(ExplorerModule);
    container.load(AddressBookModule);
    container.load(TokensModule);
    container.load(createPricesModule(config.priceProvider));
    container.load(createSecurityModule(config.biometricProvider));

    // Additional modules provided by the app
    if (config.modules) {
      for (const mod of config.modules) {
        container.load(mod);
      }
    }

    return new FlamaApp(container);
  }

  get auth(): AuthService {
    return this.container.get(TOKENS.AuthService);
  }

  get users(): UsersService {
    return this.container.get(TOKENS.UsersService);
  }

  get profile(): ProfileService {
    return this.container.get(TOKENS.ProfileService);
  }

  get wallet(): WalletService {
    return this.container.get(TOKENS.WalletService);
  }

  get explorer(): ExplorerService {
    return this.container.get(TOKENS.ExplorerService);
  }

  get addressBook(): AddressBookService {
    return this.container.get(TOKENS.AddressBookService);
  }

  get tokens(): TokensService {
    return this.container.get(TOKENS.TokensService);
  }

  get prices(): PricesService {
    return this.container.get(TOKENS.PricesService);
  }

  get security(): SecurityService {
    return this.container.get(TOKENS.SecurityService);
  }
}
