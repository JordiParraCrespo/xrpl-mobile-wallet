import { describe, expect, it } from 'vitest';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { deriveFirstName, deriveHandle } from './profile.identity';
import { ProfileService } from './profile.service';
import { createProfileStore, type ProfileStore } from './profile.state';

const NAME_STORAGE_KEY = 'flama.profile.name';

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
  const store: ProfileStore = createProfileStore();
  const service = new ProfileService(storage, store);
  return { storage, store, service };
}

describe('ProfileService', () => {
  it('persists and exposes a trimmed display name', async () => {
    const { storage, store, service } = setup();

    await service.setName('  Jordan Pierce  ');

    expect(storage.data.get(NAME_STORAGE_KEY)).toBe('Jordan Pierce');
    expect(store.getState().name).toBe('Jordan Pierce');
  });

  it('collapses inner whitespace and clips to the max length', async () => {
    const { store, service } = setup();

    await service.setName(`Jordan   Pierce ${'x'.repeat(60)}`);

    expect(store.getState().name).toHaveLength(32);
    expect(store.getState().name?.startsWith('Jordan Pierce')).toBe(true);
  });

  it('rejects a name shorter than two characters', async () => {
    const { store, service } = setup();

    await expect(service.setName(' a ')).rejects.toSatisfy(
      (error) => error instanceof AppError && error.code === 'PROFILE_CLIENT_001',
    );
    expect(store.getState().name).toBeNull();
  });

  it('restores a previously persisted name', async () => {
    const { storage, store, service } = setup();
    storage.data.set(NAME_STORAGE_KEY, 'Ada');

    await service.restore();

    expect(store.getState().name).toBe('Ada');
  });

  it('clears the persisted name', async () => {
    const { storage, store, service } = setup();
    await service.setName('Ada Lovelace');

    await service.clear();

    expect(storage.data.has(NAME_STORAGE_KEY)).toBe(false);
    expect(store.getState().name).toBeNull();
  });
});

describe('profile identity helpers', () => {
  it('derives a clean @handle from a display name', () => {
    expect(deriveHandle('Jordan Pierce')).toBe('@jordanpierce');
    expect(deriveHandle('')).toBe('@yourname');
    expect(deriveHandle('!!!')).toBe('@yourname');
  });

  it('derives a greeting first name with a friendly fallback', () => {
    expect(deriveFirstName('Jordan Pierce')).toBe('Jordan');
    expect(deriveFirstName('   ')).toBe('there');
  });
});
