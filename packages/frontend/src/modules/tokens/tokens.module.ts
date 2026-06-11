import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { TokensService } from './tokens.service';

export const TokensModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.TokensService).to(TokensService).inSingletonScope();
});
