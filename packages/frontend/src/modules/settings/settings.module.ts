import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { SettingsService } from './settings.service';
import { createSettingsStore } from './settings.state';

/**
 * Binds the settings module: the on-device app preferences (display currency,
 * appearance and notification opt-in) shown on the profile screen.
 */
export const SettingsModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.SettingsStore).toConstantValue(createSettingsStore());
  bind(TOKENS.SettingsService).to(SettingsService).inSingletonScope();
});
