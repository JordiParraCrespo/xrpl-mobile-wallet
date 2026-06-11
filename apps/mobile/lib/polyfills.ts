import { getRandomValues } from 'expo-crypto';

// `@noble/hashes` (the keyring's randomness source) captures
// `globalThis.crypto` ONCE at module load, so this polyfill must be the
// first thing the app evaluates — it is imported before `expo-router/entry`
// in index.js. Hermes has no Web Crypto; expo-crypto provides a native
// getRandomValues that works in Expo Go and dev builds alike.
type CryptoGlobal = { crypto?: { getRandomValues?: unknown } };

const globalScope = globalThis as CryptoGlobal;

if (typeof globalScope.crypto !== 'object' || globalScope.crypto === null) {
  globalScope.crypto = {};
}
if (typeof globalScope.crypto.getRandomValues !== 'function') {
  globalScope.crypto.getRandomValues = getRandomValues;
}
