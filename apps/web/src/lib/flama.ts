import { FlamaApp } from '@flama/frontend';
import { LocalStorageService } from './storage';

export const app = FlamaApp.create({
    apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
    storage: new LocalStorageService(),
});
