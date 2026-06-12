import { ContainerModule } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { NotificationsService } from './notifications.service';

export const NotificationsModule = new ContainerModule(({ bind }) => {
  // Singleton so the in-memory read/unread state persists across the session.
  bind(TOKENS.NotificationsService).to(NotificationsService).inSingletonScope();
});
