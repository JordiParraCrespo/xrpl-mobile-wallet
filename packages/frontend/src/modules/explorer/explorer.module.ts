import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { ExplorerService } from './explorer.service';

export const ExplorerModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.ExplorerService).to(ExplorerService).inSingletonScope();
});
