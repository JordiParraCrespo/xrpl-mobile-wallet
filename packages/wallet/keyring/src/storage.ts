/**
 * Minimal async key-value storage. The host app injects a secure
 * implementation (e.g. expo-secure-store on mobile); this package never
 * touches storage APIs directly.
 */
export interface SecureStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
