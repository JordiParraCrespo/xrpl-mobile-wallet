import { OpenAPI } from '@flama/api-client';
import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import type { IStorageService } from './storage.service';

export interface CoreModuleConfig {
  apiBaseUrl: string;
  storage: IStorageService;
}

export function createCoreModule(config: CoreModuleConfig): ContainerModule {
  return new ContainerModule(({ bind }) => {
    OpenAPI.BASE = config.apiBaseUrl;
    OpenAPI.WITH_CREDENTIALS = true;
    OpenAPI.CREDENTIALS = 'include';
    OpenAPI.TOKEN = async () => {
      return (await config.storage.get('accessToken')) ?? '';
    };

    bind<IStorageService>(TOKENS.StorageService).toConstantValue(config.storage);
  });
}
