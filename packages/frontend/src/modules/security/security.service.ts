import type { KeyringManager } from '@flama/wallet-keyring';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import type { IBiometricProvider } from './biometric.provider';
import { SecurityErrors } from './security.errors';
import type { SecurityStore } from './security.state';

export const PASSCODE_LENGTH = 6;
const PASSCODE_PATTERN = /^\d{6}$/;

const BIOMETRICS_ENABLED_STORAGE_KEY = 'flama.security.biometrics-enabled';
const ATTEMPTS_STORAGE_KEY = 'flama.security.attempts';
const AUTO_LOCK_STORAGE_KEY = 'flama.security.autolock';

/** Default inactivity timeout used when no value is persisted. */
const DEFAULT_AUTO_LOCK_MS = 60_000;

/** Number of failed attempts at which a lockout is first applied. */
const LOCKOUT_THRESHOLD = 5;
/** Lockout applied on the 5th failure; doubles with every further failure. */
const BASE_LOCKOUT_MS = 30_000;
const MAX_LOCKOUT_MS = 30 * 60_000;

interface PersistedAttempts {
  failedAttempts: number;
  lockoutUntil: number | null;
}

function isInvalidPasscodeError(error: unknown): boolean {
  return (error as Error).name === 'InvalidPasscodeError';
}

@injectable()
export class SecurityService {
  #autoLockTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @inject(TOKENS.KeyringManager)
    private readonly keyring: KeyringManager,
    @inject(TOKENS.StorageService)
    private readonly storage: IStorageService,
    @inject(TOKENS.BiometricProvider)
    private readonly biometrics: IBiometricProvider,
    @inject(TOKENS.SecurityStore)
    public readonly store: SecurityStore,
  ) {}

  /** Loads persisted security state and resolves the current lock status. */
  async restore(): Promise<void> {
    const [biometricsAvailable, biometricsEnabledFlag, attempts, autoLockMs, initialized] =
      await Promise.all([
        this.biometrics.isAvailable(),
        this.storage.get(BIOMETRICS_ENABLED_STORAGE_KEY),
        this.readPersistedAttempts(),
        this.readPersistedAutoLockMs(),
        this.keyring.isInitialized(),
      ]);
    this.store.setState({
      status: !initialized ? 'uninitialized' : this.keyring.isUnlocked ? 'unlocked' : 'locked',
      biometricsAvailable,
      biometricsEnabled: biometricsEnabledFlag !== null,
      failedAttempts: attempts.failedAttempts,
      lockoutUntil: attempts.lockoutUntil,
      autoLockMs,
    });
  }

  /** Creates the encrypted vault protected by `passcode` and leaves it unlocked. */
  async setupPasscode(passcode: string): Promise<void> {
    this.assertPasscodeFormat(passcode);
    if (await this.keyring.isInitialized()) {
      throw new AppError(SecurityErrors.ALREADY_INITIALIZED);
    }
    await this.keyring.initialize(passcode);
    this.store.setState({ status: 'unlocked' });
    this.touch();
  }

  /**
   * Unlocks the vault with the passcode. An active lockout rejects up front
   * with LOCKED_OUT. A wrong passcode increments the persisted attempt
   * counter and throws INVALID_PASSCODE — except for the failure that
   * triggers (or extends) a lockout, which throws LOCKED_OUT instead.
   */
  async unlock(passcode: string): Promise<void> {
    this.assertNotLockedOut();
    try {
      await this.keyring.unlock(passcode);
    } catch (error) {
      if (isInvalidPasscodeError(error)) {
        await this.registerFailedAttempt();
      }
      throw error;
    }
    await this.clearAttempts();
    this.store.setState({ status: 'unlocked' });
    this.touch();
  }

  /** Unlocks the vault via a biometric-authorized trusted unlock. */
  async unlockWithBiometrics(): Promise<void> {
    if (!(await this.keyring.isInitialized())) {
      throw new AppError(SecurityErrors.NOT_INITIALIZED);
    }
    if (!(await this.biometrics.isAvailable())) {
      throw new AppError(SecurityErrors.BIOMETRICS_UNAVAILABLE);
    }
    const biometricsEnabledFlag = await this.storage.get(BIOMETRICS_ENABLED_STORAGE_KEY);
    if (biometricsEnabledFlag === null) {
      throw new AppError(SecurityErrors.BIOMETRICS_NOT_ENROLLED);
    }
    if (!(await this.biometrics.authenticate('Unlock your wallet'))) {
      throw new AppError(SecurityErrors.BIOMETRIC_AUTH_FAILED);
    }
    await this.keyring.unlockTrusted();
    await this.clearAttempts();
    this.store.setState({ status: 'unlocked' });
    this.touch();
  }

  lock(): void {
    this.clearAutoLock();
    this.keyring.lock();
    this.store.setState({ status: 'locked' });
  }

  /**
   * Registers user activity. While unlocked with auto-lock enabled
   * (`autoLockMs > 0`), this (re)arms the inactivity timer. A no-op otherwise.
   */
  touch(): void {
    if (this.store.getState().status !== 'unlocked') {
      return;
    }
    if (this.store.getState().autoLockMs <= 0) {
      return;
    }
    this.scheduleAutoLock();
  }

  /**
   * Sets the inactivity auto-lock timeout in ms (`0` disables it), persists it
   * and reschedules the active timer when currently unlocked.
   */
  async setAutoLockTimeout(ms: number): Promise<void> {
    if (!Number.isFinite(ms) || ms < 0) {
      throw new AppError(SecurityErrors.INVALID_AUTO_LOCK);
    }
    await this.storage.set(AUTO_LOCK_STORAGE_KEY, String(ms));
    this.store.setState({ autoLockMs: ms });
    if (this.store.getState().status === 'unlocked') {
      if (ms > 0) {
        this.scheduleAutoLock();
      } else {
        this.clearAutoLock();
      }
    }
  }

  /**
   * Changes the passcode. Biometric unlock is not tied to the passcode, so an
   * enrolled biometric stays valid.
   */
  async changePasscode(current: string, next: string): Promise<void> {
    this.assertPasscodeFormat(next);
    try {
      await this.keyring.changePasscode(current, next);
    } catch (error) {
      if (isInvalidPasscodeError(error)) {
        throw new AppError(SecurityErrors.INVALID_PASSCODE);
      }
      throw error;
    }
  }

  /** Enrolls biometric unlock by recording an enabled flag behind a biometric gate. */
  async enableBiometrics(): Promise<void> {
    if (this.store.getState().status !== 'unlocked') {
      throw new AppError(SecurityErrors.NOT_INITIALIZED);
    }
    if (!(await this.biometrics.isAvailable())) {
      throw new AppError(SecurityErrors.BIOMETRICS_UNAVAILABLE);
    }
    if (!(await this.biometrics.authenticate('Enable biometric unlock'))) {
      throw new AppError(SecurityErrors.BIOMETRIC_AUTH_FAILED);
    }
    await this.storage.set(BIOMETRICS_ENABLED_STORAGE_KEY, '1');
    this.store.setState({ biometricsEnabled: true });
  }

  async disableBiometrics(): Promise<void> {
    await this.storage.remove(BIOMETRICS_ENABLED_STORAGE_KEY);
    this.store.setState({ biometricsEnabled: false });
  }

  /**
   * Forgot-passcode escape hatch: destroys the vault and all security state.
   * Device biometric availability is preserved (it is a hardware property).
   */
  async wipe(): Promise<void> {
    this.clearAutoLock();
    await this.keyring.reset();
    await this.storage.remove(BIOMETRICS_ENABLED_STORAGE_KEY);
    await this.storage.remove(ATTEMPTS_STORAGE_KEY);
    this.store.setState({
      status: 'uninitialized',
      biometricsEnabled: false,
      failedAttempts: 0,
      lockoutUntil: null,
    });
  }

  /** (Re)starts the inactivity timer that locks the wallet when it fires. */
  private scheduleAutoLock(): void {
    this.clearAutoLock();
    const ms = this.store.getState().autoLockMs;
    this.#autoLockTimer = setTimeout(() => {
      this.#autoLockTimer = null;
      this.lock();
    }, ms);
  }

  /** Cancels any pending inactivity timer. Safe to call when none is set. */
  private clearAutoLock(): void {
    if (this.#autoLockTimer !== null) {
      clearTimeout(this.#autoLockTimer);
      this.#autoLockTimer = null;
    }
  }

  private async readPersistedAutoLockMs(): Promise<number> {
    const raw = await this.storage.get(AUTO_LOCK_STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return DEFAULT_AUTO_LOCK_MS;
  }

  private assertPasscodeFormat(passcode: string): void {
    if (!PASSCODE_PATTERN.test(passcode)) {
      throw new AppError(SecurityErrors.INVALID_PASSCODE_FORMAT);
    }
  }

  private assertNotLockedOut(): void {
    const { lockoutUntil } = this.store.getState();
    if (lockoutUntil !== null && lockoutUntil > Date.now()) {
      throw new AppError(SecurityErrors.LOCKED_OUT);
    }
  }

  /**
   * Records a failed passcode attempt. From the 5th failure onwards a
   * lockout of 30s * 2^(failures - 5), capped at 30 minutes, is applied.
   * Always throws: LOCKED_OUT when a lockout was just applied, otherwise
   * INVALID_PASSCODE.
   */
  private async registerFailedAttempt(): Promise<never> {
    const failedAttempts = this.store.getState().failedAttempts + 1;
    let lockoutUntil = this.store.getState().lockoutUntil;
    let lockedOut = false;
    if (failedAttempts >= LOCKOUT_THRESHOLD) {
      const duration = Math.min(
        BASE_LOCKOUT_MS * 2 ** (failedAttempts - LOCKOUT_THRESHOLD),
        MAX_LOCKOUT_MS,
      );
      lockoutUntil = Date.now() + duration;
      lockedOut = true;
    }
    this.store.setState({ failedAttempts, lockoutUntil });
    await this.storage.set(
      ATTEMPTS_STORAGE_KEY,
      JSON.stringify({
        failedAttempts,
        lockoutUntil,
      } satisfies PersistedAttempts),
    );
    throw new AppError(lockedOut ? SecurityErrors.LOCKED_OUT : SecurityErrors.INVALID_PASSCODE);
  }

  private async clearAttempts(): Promise<void> {
    this.store.setState({ failedAttempts: 0, lockoutUntil: null });
    await this.storage.remove(ATTEMPTS_STORAGE_KEY);
  }

  private async readPersistedAttempts(): Promise<PersistedAttempts> {
    const raw = await this.storage.get(ATTEMPTS_STORAGE_KEY);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw) as Partial<PersistedAttempts>;
        return {
          failedAttempts: typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
          lockoutUntil: typeof parsed.lockoutUntil === 'number' ? parsed.lockoutUntil : null,
        };
      } catch {
        // Corrupt entry — fall through to defaults.
      }
    }
    return { failedAttempts: 0, lockoutUntil: null };
  }
}
