import { injectable } from 'inversify';
import type { WalletNotification } from './notification.types';
import { MOCK_NOTIFICATIONS } from './notifications.data';

/**
 * Wallet notification feed behind the home bell panel.
 *
 * Currently backed by an in-memory copy of {@link MOCK_NOTIFICATIONS}; "mark
 * all as read" mutates that copy so the change survives within the session.
 * Swapping in a real backend feed only touches this service — the read model,
 * hooks and UI stay the same.
 */
@injectable()
export class NotificationsService {
  #items: WalletNotification[] = MOCK_NOTIFICATIONS.map((n) => ({ ...n }));

  /** The full feed, newest groups first. Returns copies so callers can't mutate state. */
  async list(): Promise<WalletNotification[]> {
    return this.#items.map((n) => ({ ...n }));
  }

  /** Number of unread notifications — drives the bell's unread dot. */
  async unreadCount(): Promise<number> {
    return this.#items.reduce((count, n) => count + (n.unread ? 1 : 0), 0);
  }

  /** Clears the unread flag on every notification. */
  async markAllRead(): Promise<void> {
    this.#items = this.#items.map((n) => (n.unread ? { ...n, unread: false } : n));
  }
}
