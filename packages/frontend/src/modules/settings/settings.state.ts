import { createStore } from 'zustand/vanilla';

/** Which color scheme the app follows. `system` defers to the OS. */
export type AppearanceMode = 'system' | 'light' | 'dark';

export interface SettingsState {
  /**
   * ISO 4217 code for the fiat currency balances are displayed in. Defaults to
   * USD until `restore()` loads the persisted choice.
   */
  displayCurrency: string;
  /** The color scheme the app follows. */
  appearance: AppearanceMode;
  /** Whether the user has opted into push notifications. */
  notificationsEnabled: boolean;
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

/** The out-of-the-box preferences, used before anything is persisted. */
export const DEFAULT_SETTINGS: SettingsState = {
  displayCurrency: 'USD',
  appearance: 'system',
  notificationsEnabled: true,
};

export const createSettingsStore = () =>
  createStore<SettingsState>(() => ({ ...DEFAULT_SETTINGS }));
