import { createStore } from 'zustand/vanilla';

export interface ProfileState {
  /**
   * The local display name the user picked in onboarding. `null` until
   * `restore()` has run, and stays `null` if no name has been set yet.
   */
  name: string | null;
}

export type ProfileStore = ReturnType<typeof createProfileStore>;

export const createProfileStore = () =>
  createStore<ProfileState>(() => ({
    name: null,
  }));
