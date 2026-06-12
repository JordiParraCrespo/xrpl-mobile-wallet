import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes, hexToBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils';
import { VaultCorruptedError } from './errors';

/**
 * Storage layout. Secrets are stored as plaintext JSON: the host injects a
 * hardware-backed secure store (Keychain / Keystore via expo-secure-store on
 * mobile), which encrypts every entry at rest — that enclave is the protection
 * boundary, so the keyring adds no key-derivation of its own. The passcode is a
 * UI lock, kept as a salted-hash verifier rather than an encryption key.
 */
export const VAULT_STORAGE_KEY = 'flama.wallet.vault.v2';
/** Legacy v1 plaintext vault (pre-passcode); migrated on initialize. */
export const LEGACY_VAULT_STORAGE_KEY = 'flama.wallet.vault';
/** The passcode verifier ({@link PasscodeVerifier} as JSON). */
export const PASSCODE_STORAGE_KEY = 'flama.wallet.passcode';

const SALT_LENGTH = 16;

export type VaultWallet = {
  id: string;
  name: string;
  createdAt: number;
  backedUp: boolean;
} & ({ type: 'hd'; mnemonic: string } | { type: 'xrpl-seed'; seed: string });

/** Plaintext vault contents. Persisted as-is; held in memory while unlocked. */
export interface VaultData {
  version: 2;
  wallets: VaultWallet[];
  activeWalletId: string | null;
}

/** Salted SHA-256 of the passcode — gates the UI, never wraps key material. */
interface PasscodeVerifier {
  salt: string;
  hash: string;
}

function hashPasscode(passcode: string, salt: Uint8Array): string {
  return bytesToHex(sha256(concatBytes(salt, utf8ToBytes(passcode))));
}

/** Builds a fresh salted verifier for `passcode`. */
export function createPasscodeVerifier(passcode: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const verifier: PasscodeVerifier = {
    salt: bytesToHex(salt),
    hash: hashPasscode(passcode, salt),
  };
  return JSON.stringify(verifier);
}

/** Whether `passcode` matches the stored verifier. */
export function verifyPasscode(passcode: string, raw: string): boolean {
  let verifier: PasscodeVerifier;
  try {
    verifier = JSON.parse(raw) as PasscodeVerifier;
  } catch {
    throw new VaultCorruptedError('Passcode verifier is not valid JSON');
  }
  if (typeof verifier?.salt !== 'string' || typeof verifier?.hash !== 'string') {
    throw new VaultCorruptedError('Passcode verifier has an unexpected shape');
  }
  return hashPasscode(passcode, hexToBytes(verifier.salt)) === verifier.hash;
}

export function serializeVault(data: VaultData): string {
  return JSON.stringify(data);
}

/** Parses and shape-checks the stored vault. */
export function parseVault(raw: string): VaultData {
  let data: VaultData;
  try {
    data = JSON.parse(raw) as VaultData;
  } catch {
    throw new VaultCorruptedError('Vault is not valid JSON');
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    data.version !== 2 ||
    !Array.isArray(data.wallets) ||
    (data.activeWalletId !== null && typeof data.activeWalletId !== 'string')
  ) {
    throw new VaultCorruptedError('Vault has an unexpected shape');
  }
  return data;
}
