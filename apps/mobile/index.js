// Custom entry so the crypto polyfill is evaluated before ANY app or
// router module — `@noble/hashes` snapshots `globalThis.crypto` at load.
import './lib/polyfills';
import 'expo-router/entry';
