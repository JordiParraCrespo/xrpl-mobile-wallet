import { describe, expect, it } from 'vitest';
import { MOCK_NOTIFICATIONS } from './notifications.data';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('lists the full mock feed', async () => {
    const service = new NotificationsService();
    await expect(service.list()).resolves.toHaveLength(MOCK_NOTIFICATIONS.length);
  });

  it('returns copies so callers cannot mutate internal state', async () => {
    const service = new NotificationsService();
    const items = await service.list();
    items[0].unread = !items[0].unread;
    const again = await service.list();
    expect(again[0].unread).toBe(MOCK_NOTIFICATIONS[0].unread);
  });

  it('counts unread notifications', async () => {
    const service = new NotificationsService();
    const expected = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;
    await expect(service.unreadCount()).resolves.toBe(expected);
  });

  it('clears every unread flag on markAllRead', async () => {
    const service = new NotificationsService();
    await service.markAllRead();
    await expect(service.unreadCount()).resolves.toBe(0);
    const items = await service.list();
    expect(items.every((n) => !n.unread)).toBe(true);
  });
});
