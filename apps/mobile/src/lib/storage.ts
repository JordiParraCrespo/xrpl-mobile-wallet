import type { IStorageService } from "@flama/frontend";
import * as SecureStore from "expo-secure-store";

export class SecureStorageService implements IStorageService {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  async clear(): Promise<void> {
    // SecureStore doesn't support clear, handled per-key
  }
}
