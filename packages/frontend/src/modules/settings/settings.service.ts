import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { SettingsErrors } from './settings.errors';
import { type AppearanceMode, DEFAULT_SETTINGS, type SettingsStore } from './settings.state';

/** Device-storage keys for the persisted preferences. */
const CURRENCY_STORAGE_KEY = 'flama.settings.currency';
const APPEARANCE_STORAGE_KEY = 'flama.settings.appearance';
const NOTIFICATIONS_STORAGE_KEY = 'flama.settings.notifications';

/** Fiat currencies balances can be displayed in. */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'] as const;
export type DisplayCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const APPEARANCE_MODES: readonly AppearanceMode[] = ['system', 'light', 'dark'];

/**
 * Owns the user's **local app preferences** — display currency, appearance and
 * notification opt-in — kept on the device alongside the profile. These are
 * presentation choices independent of the wallet vault and the remote,
 * auth-backed `users` domain; biometric unlock lives in the `security` module,
 * not here.
 */
@injectable()
export class SettingsService {
  constructor(
    @inject(TOKENS.StorageService)
    private readonly storage: IStorageService,
    @inject(TOKENS.SettingsStore)
    public readonly store: SettingsStore,
  ) {}

  /** Loads the persisted preferences into the store, falling back to defaults. */
  async restore(): Promise<void> {
    const [currency, appearance, notifications] = await Promise.all([
      this.storage.get(CURRENCY_STORAGE_KEY),
      this.storage.get(APPEARANCE_STORAGE_KEY),
      this.storage.get(NOTIFICATIONS_STORAGE_KEY),
    ]);

    this.store.setState({
      displayCurrency: this.isSupportedCurrency(currency)
        ? currency
        : DEFAULT_SETTINGS.displayCurrency,
      appearance: this.isAppearanceMode(appearance) ? appearance : DEFAULT_SETTINGS.appearance,
      notificationsEnabled:
        notifications === null ? DEFAULT_SETTINGS.notificationsEnabled : notifications === 'true',
    });
  }

  /** Validates and persists the fiat currency balances are shown in. */
  async setDisplayCurrency(code: string): Promise<void> {
    const next = (code ?? '').trim().toUpperCase();
    if (!this.isSupportedCurrency(next)) {
      throw new AppError(SettingsErrors.UNSUPPORTED_CURRENCY);
    }
    await this.storage.set(CURRENCY_STORAGE_KEY, next);
    this.store.setState({ displayCurrency: next });
  }

  /** Validates and persists the appearance (color scheme) preference. */
  async setAppearance(mode: AppearanceMode): Promise<void> {
    if (!this.isAppearanceMode(mode)) {
      throw new AppError(SettingsErrors.INVALID_APPEARANCE);
    }
    await this.storage.set(APPEARANCE_STORAGE_KEY, mode);
    this.store.setState({ appearance: mode });
  }

  /** Persists the notification opt-in flag. */
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await this.storage.set(NOTIFICATIONS_STORAGE_KEY, enabled ? 'true' : 'false');
    this.store.setState({ notificationsEnabled: enabled });
  }

  /** Forgets all preferences and resets the store to defaults (device wipe). */
  async clear(): Promise<void> {
    await Promise.all([
      this.storage.remove(CURRENCY_STORAGE_KEY),
      this.storage.remove(APPEARANCE_STORAGE_KEY),
      this.storage.remove(NOTIFICATIONS_STORAGE_KEY),
    ]);
    this.store.setState({ ...DEFAULT_SETTINGS });
  }

  private isSupportedCurrency(code: string | null): code is DisplayCurrency {
    return code !== null && (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
  }

  private isAppearanceMode(mode: string | null): mode is AppearanceMode {
    return mode !== null && APPEARANCE_MODES.includes(mode as AppearanceMode);
  }
}
