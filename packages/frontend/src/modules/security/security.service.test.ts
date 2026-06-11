import type { KeyringManager } from '@flama/wallet-keyring';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import type { IBiometricProvider } from './biometric.provider';
import { SecurityErrors } from './security.errors';
import { SecurityService } from './security.service';
import { createSecurityStore, type SecurityStore } from './security.state';

const BIOMETRIC_KEY_STORAGE_KEY = 'flama.security.biometric-key';
const ATTEMPTS_STORAGE_KEY = 'flama.security.attempts';

class InvalidPasscodeError extends Error {
  name = 'InvalidPasscodeError';
}

class FakeKeyring {
  passcode: string | null = null;
  vaultKey = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02]);
  isUnlocked = false;

  isInitialized(): Promise<boolean> {
    return Promise.resolve(this.passcode !== null);
  }

  hasLegacyVault(): Promise<boolean> {
    return Promise.resolve(false);
  }

  initialize(passcode: string): Promise<void> {
    this.passcode = passcode;
    this.isUnlocked = true;
    return Promise.resolve();
  }

  unlock(passcode: string): Promise<void> {
    if (passcode !== this.passcode) {
      return Promise.reject(new InvalidPasscodeError());
    }
    this.isUnlocked = true;
    return Promise.resolve();
  }

  unlockWithKey(vaultKey: Uint8Array): Promise<void> {
    const matches =
      vaultKey.length === this.vaultKey.length &&
      vaultKey.every((byte, i) => byte === this.vaultKey[i]);
    if (!matches) {
      return Promise.reject(new InvalidPasscodeError());
    }
    this.isUnlocked = true;
    return Promise.resolve();
  }

  getVaultKey(): Uint8Array {
    if (!this.isUnlocked) {
      throw new Error('Vault is locked');
    }
    return this.vaultKey;
  }

  lock(): void {
    this.isUnlocked = false;
  }

  changePasscode(current: string, next: string): Promise<void> {
    if (current !== this.passcode) {
      return Promise.reject(new InvalidPasscodeError());
    }
    this.passcode = next;
    return Promise.resolve();
  }

  reset(): Promise<void> {
    this.passcode = null;
    this.isUnlocked = false;
    return Promise.resolve();
  }
}

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

class FakeBiometrics implements IBiometricProvider {
  constructor(
    public available = true,
    public promptResult = true,
  ) {}

  isAvailable(): Promise<boolean> {
    return Promise.resolve(this.available);
  }

  authenticate(_reason: string): Promise<boolean> {
    return Promise.resolve(this.promptResult);
  }
}

const PASSCODE = '123456';

async function expectAppError(promise: Promise<unknown>, code: string): Promise<void> {
  await expect(promise).rejects.toSatisfy(
    (error) => error instanceof AppError && error.code === code,
  );
}

describe('SecurityService', () => {
  let keyring: FakeKeyring;
  let storage: FakeStorage;
  let biometrics: FakeBiometrics;
  let store: SecurityStore;
  let service: SecurityService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_750_000_000_000);
    keyring = new FakeKeyring();
    storage = new FakeStorage();
    biometrics = new FakeBiometrics();
    store = createSecurityStore();
    service = new SecurityService(keyring as unknown as KeyringManager, storage, biometrics, store);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function failUnlock(times: number): Promise<AppError> {
    let last: AppError | undefined;
    for (let i = 0; i < times; i++) {
      try {
        await service.unlock('000000');
      } catch (error) {
        last = error as AppError;
      }
    }
    if (!last) {
      throw new Error('expected unlock to fail');
    }
    return last;
  }

  describe('restore', () => {
    it('reports uninitialized when no vault exists', async () => {
      await service.restore();
      expect(store.getState().status).toBe('uninitialized');
    });

    it('reports locked when initialized but the keyring is locked', async () => {
      keyring.passcode = PASSCODE;
      keyring.isUnlocked = false;
      await service.restore();
      expect(store.getState().status).toBe('locked');
    });

    it('reports unlocked when the keyring is unlocked', async () => {
      keyring.passcode = PASSCODE;
      keyring.isUnlocked = true;
      await service.restore();
      expect(store.getState().status).toBe('unlocked');
    });

    it('loads biometric availability and enrollment', async () => {
      biometrics.available = true;
      storage.data.set(BIOMETRIC_KEY_STORAGE_KEY, 'deadbeef0102');
      await service.restore();
      expect(store.getState().biometricsAvailable).toBe(true);
      expect(store.getState().biometricsEnabled).toBe(true);
    });

    it('loads persisted failed attempts and lockout', async () => {
      const lockoutUntil = Date.now() + 60_000;
      storage.data.set(ATTEMPTS_STORAGE_KEY, JSON.stringify({ failedAttempts: 5, lockoutUntil }));
      await service.restore();
      expect(store.getState().failedAttempts).toBe(5);
      expect(store.getState().lockoutUntil).toBe(lockoutUntil);
    });

    it('falls back to defaults on a corrupt attempts entry', async () => {
      storage.data.set(ATTEMPTS_STORAGE_KEY, 'not-json');
      await service.restore();
      expect(store.getState().failedAttempts).toBe(0);
      expect(store.getState().lockoutUntil).toBeNull();
    });
  });

  describe('setupPasscode', () => {
    it('rejects passcodes that are not 6 digits', async () => {
      await expectAppError(
        service.setupPasscode('12345'),
        SecurityErrors.INVALID_PASSCODE_FORMAT.code,
      );
      await expectAppError(
        service.setupPasscode('abcdef'),
        SecurityErrors.INVALID_PASSCODE_FORMAT.code,
      );
      await expectAppError(
        service.setupPasscode('1234567'),
        SecurityErrors.INVALID_PASSCODE_FORMAT.code,
      );
    });

    it('initializes the vault and leaves the wallet unlocked', async () => {
      await service.setupPasscode(PASSCODE);
      expect(keyring.passcode).toBe(PASSCODE);
      expect(store.getState().status).toBe('unlocked');
    });

    it('rejects when a vault already exists', async () => {
      await service.setupPasscode(PASSCODE);
      await expectAppError(
        service.setupPasscode('654321'),
        SecurityErrors.ALREADY_INITIALIZED.code,
      );
    });
  });

  describe('unlock', () => {
    beforeEach(async () => {
      await service.setupPasscode(PASSCODE);
      service.lock();
    });

    it('unlocks with the correct passcode', async () => {
      await service.unlock(PASSCODE);
      expect(store.getState().status).toBe('unlocked');
      expect(keyring.isUnlocked).toBe(true);
    });

    it('counts and persists failed attempts', async () => {
      await expectAppError(service.unlock('000000'), SecurityErrors.INVALID_PASSCODE.code);
      await expectAppError(service.unlock('000000'), SecurityErrors.INVALID_PASSCODE.code);
      expect(store.getState().failedAttempts).toBe(2);
      expect(JSON.parse(storage.data.get(ATTEMPTS_STORAGE_KEY) ?? '')).toEqual({
        failedAttempts: 2,
        lockoutUntil: null,
      });
    });

    it('applies a 30s lockout on the 5th failure and throws LOCKED_OUT', async () => {
      const error = await failUnlock(5);
      expect(error.code).toBe(SecurityErrors.LOCKED_OUT.code);
      expect(store.getState().failedAttempts).toBe(5);
      expect(store.getState().lockoutUntil).toBe(Date.now() + 30_000);
    });

    it('rejects even a correct passcode while a lockout is active', async () => {
      await failUnlock(5);
      await expectAppError(service.unlock(PASSCODE), SecurityErrors.LOCKED_OUT.code);
      expect(store.getState().status).toBe('locked');
    });

    it('doubles the lockout duration on each failure past the threshold', async () => {
      await failUnlock(5);
      vi.advanceTimersByTime(30_001);
      await expectAppError(service.unlock('000000'), SecurityErrors.LOCKED_OUT.code);
      expect(store.getState().failedAttempts).toBe(6);
      expect(store.getState().lockoutUntil).toBe(Date.now() + 60_000);

      vi.advanceTimersByTime(60_001);
      await expectAppError(service.unlock('000000'), SecurityErrors.LOCKED_OUT.code);
      expect(store.getState().lockoutUntil).toBe(Date.now() + 120_000);
    });

    it('caps the lockout at 30 minutes', async () => {
      store.setState({ failedAttempts: 20, lockoutUntil: null });
      await expectAppError(service.unlock('000000'), SecurityErrors.LOCKED_OUT.code);
      expect(store.getState().lockoutUntil).toBe(Date.now() + 30 * 60_000);
    });

    it('allows unlocking again after the lockout expires', async () => {
      await failUnlock(5);
      vi.advanceTimersByTime(30_001);
      await service.unlock(PASSCODE);
      expect(store.getState().status).toBe('unlocked');
    });

    it('clears attempts in memory and storage on success', async () => {
      await failUnlock(3);
      await service.unlock(PASSCODE);
      expect(store.getState().failedAttempts).toBe(0);
      expect(store.getState().lockoutUntil).toBeNull();
      expect(storage.data.has(ATTEMPTS_STORAGE_KEY)).toBe(false);
    });
  });

  describe('biometrics', () => {
    beforeEach(async () => {
      await service.setupPasscode(PASSCODE);
      await service.restore();
    });

    it('enableBiometrics requires the wallet to be unlocked', async () => {
      service.lock();
      await expectAppError(service.enableBiometrics(), SecurityErrors.NOT_INITIALIZED.code);
    });

    it('enableBiometrics rejects when biometrics are unavailable', async () => {
      biometrics.available = false;
      await expectAppError(service.enableBiometrics(), SecurityErrors.BIOMETRICS_UNAVAILABLE.code);
    });

    it('enableBiometrics rejects when the prompt is declined', async () => {
      biometrics.promptResult = false;
      await expectAppError(service.enableBiometrics(), SecurityErrors.BIOMETRIC_AUTH_FAILED.code);
      expect(storage.data.has(BIOMETRIC_KEY_STORAGE_KEY)).toBe(false);
    });

    it('enableBiometrics stores the vault key as hex', async () => {
      await service.enableBiometrics();
      expect(storage.data.get(BIOMETRIC_KEY_STORAGE_KEY)).toBe('deadbeef0102');
      expect(store.getState().biometricsEnabled).toBe(true);
    });

    it('unlockWithBiometrics rejects when no vault exists', async () => {
      await keyring.reset();
      keyring.passcode = null;
      await expectAppError(service.unlockWithBiometrics(), SecurityErrors.NOT_INITIALIZED.code);
    });

    it('unlockWithBiometrics rejects when biometrics are unavailable', async () => {
      await service.enableBiometrics();
      biometrics.available = false;
      await expectAppError(
        service.unlockWithBiometrics(),
        SecurityErrors.BIOMETRICS_UNAVAILABLE.code,
      );
    });

    it('unlockWithBiometrics rejects when not enrolled', async () => {
      service.lock();
      await expectAppError(
        service.unlockWithBiometrics(),
        SecurityErrors.BIOMETRICS_NOT_ENROLLED.code,
      );
    });

    it('unlockWithBiometrics rejects when the prompt is declined', async () => {
      await service.enableBiometrics();
      service.lock();
      biometrics.promptResult = false;
      await expectAppError(
        service.unlockWithBiometrics(),
        SecurityErrors.BIOMETRIC_AUTH_FAILED.code,
      );
      expect(store.getState().status).toBe('locked');
    });

    it('unlockWithBiometrics unlocks with the stored vault key', async () => {
      await service.enableBiometrics();
      service.lock();
      await service.unlockWithBiometrics();
      expect(store.getState().status).toBe('unlocked');
      expect(keyring.isUnlocked).toBe(true);
    });

    it('disableBiometrics removes the stored key', async () => {
      await service.enableBiometrics();
      await service.disableBiometrics();
      expect(storage.data.has(BIOMETRIC_KEY_STORAGE_KEY)).toBe(false);
      expect(store.getState().biometricsEnabled).toBe(false);
      service.lock();
      await expectAppError(
        service.unlockWithBiometrics(),
        SecurityErrors.BIOMETRICS_NOT_ENROLLED.code,
      );
    });
  });

  describe('changePasscode', () => {
    beforeEach(async () => {
      await service.setupPasscode(PASSCODE);
      await service.restore();
    });

    it('rejects an invalid new passcode format', async () => {
      await expectAppError(
        service.changePasscode(PASSCODE, '12'),
        SecurityErrors.INVALID_PASSCODE_FORMAT.code,
      );
    });

    it('rejects a wrong current passcode', async () => {
      await expectAppError(
        service.changePasscode('000000', '654321'),
        SecurityErrors.INVALID_PASSCODE.code,
      );
    });

    it('changes the passcode', async () => {
      await service.changePasscode(PASSCODE, '654321');
      service.lock();
      await expectAppError(service.unlock(PASSCODE), SecurityErrors.INVALID_PASSCODE.code);
      await service.unlock('654321');
      expect(store.getState().status).toBe('unlocked');
    });

    it('keeps biometric unlock working after a passcode change', async () => {
      await service.enableBiometrics();
      await service.changePasscode(PASSCODE, '654321');
      service.lock();
      await service.unlockWithBiometrics();
      expect(store.getState().status).toBe('unlocked');
    });
  });

  describe('lock', () => {
    it('locks the keyring and the store', async () => {
      await service.setupPasscode(PASSCODE);
      service.lock();
      expect(keyring.isUnlocked).toBe(false);
      expect(store.getState().status).toBe('locked');
    });
  });

  describe('wipe', () => {
    it('resets the keyring, storage and store', async () => {
      await service.setupPasscode(PASSCODE);
      await service.restore();
      await service.enableBiometrics();
      service.lock();
      await failUnlock(5);

      await service.wipe();

      expect(keyring.passcode).toBeNull();
      expect(storage.data.has(BIOMETRIC_KEY_STORAGE_KEY)).toBe(false);
      expect(storage.data.has(ATTEMPTS_STORAGE_KEY)).toBe(false);
      expect(store.getState()).toMatchObject({
        status: 'uninitialized',
        biometricsEnabled: false,
        failedAttempts: 0,
        lockoutUntil: null,
      });
    });

    it('allows setting up a fresh passcode after a wipe', async () => {
      await service.setupPasscode(PASSCODE);
      await service.wipe();
      await service.setupPasscode('654321');
      expect(store.getState().status).toBe('unlocked');
    });
  });
});
