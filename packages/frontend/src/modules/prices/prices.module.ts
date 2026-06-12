import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { CoinGeckoPriceProvider, type IPriceProvider } from './price.provider';
import { PricesService } from './prices.service';
import { createPricesStore } from './prices.state';

/**
 * Binds the prices module: fiat exchange rates for the wallet's fiat-first
 * balance. Pass a price provider, or omit it to use the built-in CoinGecko
 * provider.
 */
export function createPricesModule(priceProvider?: IPriceProvider): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind(TOKENS.PricesStore).toConstantValue(createPricesStore());
    bind(TOKENS.PriceProvider).toConstantValue(priceProvider ?? new CoinGeckoPriceProvider());
    bind(TOKENS.PricesService).to(PricesService).inSingletonScope();
  });
}
