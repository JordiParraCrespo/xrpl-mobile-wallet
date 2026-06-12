import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import type { IStorageService } from '../core/storage.service';
import { ProfileErrors } from './profile.errors';
import type { ProfileStore } from './profile.state';

/** Device-storage key for the local display name. */
const NAME_STORAGE_KEY = 'flama.profile.name';

/** A name must be at least this many characters to be accepted. */
export const MIN_NAME_LENGTH = 2;
/** Names are clipped to this length before being persisted. */
export const MAX_NAME_LENGTH = 32;

/**
 * Owns the user's **local profile** — currently the display name picked in
 * onboarding, kept on the device. It is the identity shown on the profile and
 * used when chatting with the wallet assistant; it never leaves the device and
 * is independent of the wallet vault (so it can be set before a passcode
 * exists). This is distinct from the remote, auth-backed `users` domain.
 */
@injectable()
export class ProfileService {
  constructor(
    @inject(TOKENS.StorageService)
    private readonly storage: IStorageService,
    @inject(TOKENS.ProfileStore)
    public readonly store: ProfileStore,
  ) {}

  /** Loads the persisted display name into the store. */
  async restore(): Promise<void> {
    const name = await this.storage.get(NAME_STORAGE_KEY);
    this.store.setState({ name: name ?? null });
  }

  /** Normalizes, validates and persists the display name. */
  async setName(rawName: string): Promise<void> {
    const name = (rawName ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
    if (name.length < MIN_NAME_LENGTH) {
      throw new AppError(ProfileErrors.INVALID_NAME);
    }
    await this.storage.set(NAME_STORAGE_KEY, name);
    this.store.setState({ name });
  }

  /** Forgets the display name (e.g. when wiping the device). */
  async clear(): Promise<void> {
    await this.storage.remove(NAME_STORAGE_KEY);
    this.store.setState({ name: null });
  }
}
