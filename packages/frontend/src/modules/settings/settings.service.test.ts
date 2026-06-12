import { describe, expect, it } from 'vitest';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { SettingsService } from './settings.service';
import { createSettingsStore, type SettingsStore } from './settings.state';

const CURRENCY_STORAGE_KEY = 'flama.settings.currency';
const APPEARANCE_STORAGE_KEY = 'flama.settings.appearance';
const NOTIFICATIONS_STORAGE_KEY = 'flama.settings.notifications';

class FakeStorage implements IStorageService {
  readonly data = new Map<string, string>();

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.data.get(key) ?? null);
  }

  set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.data.clear();
    return Promise.resolve();
  }
}

function setup() {
  const storage = new FakeStorage();
  const store: SettingsStore = createSettingsStore();
  const service = new SettingsService(storage, store);
  return { storage, store, service };
}

describe('SettingsService', () => {
  it('exposes sensible defaults before anything is persisted', () => {
    const { store } = setup();

    expect(store.getState()).toEqual({
      displayCurrency: 'USD',
      appearance: 'system',
      notificationsEnabled: true,
    });
  });

  it('normalizes and persists a supported display currency', async () => {
    const { storage, store, service } = setup();

    await service.setDisplayCurrency(' eur ');

    expect(storage.data.get(CURRENCY_STORAGE_KEY)).toBe('EUR');
    expect(store.getState().displayCurrency).toBe('EUR');
  });

  it('rejects an unsupported display currency', async () => {
    const { store, service } = setup();

    await expect(service.setDisplayCurrency('XYZ')).rejects.toSatisfy(
      (error) => error instanceof AppError && error.code === 'SETTINGS_CLIENT_001',
    );
    expect(store.getState().displayCurrency).toBe('USD');
  });

  it('persists the appearance preference', async () => {
    const { storage, store, service } = setup();

    await service.setAppearance('dark');

    expect(storage.data.get(APPEARANCE_STORAGE_KEY)).toBe('dark');
    expect(store.getState().appearance).toBe('dark');
  });

  it('persists the notification opt-in flag', async () => {
    const { storage, store, service } = setup();

    await service.setNotificationsEnabled(false);

    expect(storage.data.get(NOTIFICATIONS_STORAGE_KEY)).toBe('false');
    expect(store.getState().notificationsEnabled).toBe(false);
  });

  it('restores persisted preferences and ignores invalid stored values', async () => {
    const { storage, store, service } = setup();
    storage.data.set(CURRENCY_STORAGE_KEY, 'GBP');
    storage.data.set(APPEARANCE_STORAGE_KEY, 'nonsense');
    storage.data.set(NOTIFICATIONS_STORAGE_KEY, 'false');

    await service.restore();

    expect(store.getState()).toEqual({
      displayCurrency: 'GBP',
      appearance: 'system',
      notificationsEnabled: false,
    });
  });

  it('clears all preferences back to defaults', async () => {
    const { storage, store, service } = setup();
    await service.setDisplayCurrency('EUR');
    await service.setAppearance('dark');
    await service.setNotificationsEnabled(false);

    await service.clear();

    expect(storage.data.size).toBe(0);
    expect(store.getState()).toEqual({
      displayCurrency: 'USD',
      appearance: 'system',
      notificationsEnabled: true,
    });
  });
});
