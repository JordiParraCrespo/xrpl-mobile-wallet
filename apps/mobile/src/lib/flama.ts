import { FlamaApp } from '@flama/frontend';
import { SecureStorageService } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const app = FlamaApp.create({
  apiBaseUrl: API_URL,
  storage: new SecureStorageService(),
});
