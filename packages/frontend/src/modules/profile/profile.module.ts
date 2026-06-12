import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { ProfileService } from './profile.service';
import { createProfileStore } from './profile.state';

/**
 * Binds the local-profile module: the on-device display name used across the
 * profile and assistant conversations.
 */
export const ProfileModule = new ContainerModule(({ bind }) => {
  bind(TOKENS.ProfileStore).toConstantValue(createProfileStore());
  bind(TOKENS.ProfileService).to(ProfileService).inSingletonScope();
});
