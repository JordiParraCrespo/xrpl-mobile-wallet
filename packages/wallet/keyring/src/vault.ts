import { gcm } from '@noble/ciphers/aes';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils';
import { scrypt } from '@noble/hashes/scrypt';
import { randomBytes } from '@noble/hashes/utils';
import { InvalidPasscodeError, VaultCorruptedError } from './errors';

/** Storage key of the v2 encrypted vault envelope. */
export const VAULT_STORAGE_KEY = 'flama.wallet.vault.v2';
/** Storage key of the legacy v1 plaintext vault. */
export const LEGACY_VAULT_STORAGE_KEY = 'flama.wallet.vault';

export interface KdfParams {
  n: number;
  r: number;
  p: number;
}

export const DEFAULT_KDF_PARAMS: KdfParams = { n: 16384, r: 8, p: 1 };

const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;

export type VaultWallet = {
  id: string;
  name: string;
  createdAt: number;
  backedUp: boolean;
} & ({ type: 'hd'; mnemonic: string } | { type: 'xrpl-seed'; seed: string });

/** Plaintext vault contents — only ever exists decrypted in memory. */
export interface VaultData {
  version: 2;
  wallets: VaultWallet[];
  activeWalletId: string | null;
}

interface CipherBlob {
  nonce: string;
  ciphertext: string;
}

/**
 * Persisted envelope: a random 32-byte vault key encrypts the data blob,
 * and a scrypt-derived KEK (from the passcode) wraps the vault key. Both
 * encryptions are AES-256-GCM with fresh 12-byte nonces.
 */
export interface VaultEnvelope {
  version: 2;
  kdf: { algo: 'scrypt'; salt: string; n: number; r: number; p: number };
  wrappedKey: CipherBlob;
  data: CipherBlob;
}

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = new Map([...B64_ALPHABET].map((char, value) => [char, value]));

function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? '=' : B64_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? '=' : B64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

function fromBase64(text: string): Uint8Array {
  if (text.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text)) {
    throw new VaultCorruptedError('Invalid base64 in vault envelope');
  }
  const stripped = text.replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((stripped.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (const char of stripped) {
    // biome-ignore lint/style/noNonNullAssertion: alphabet membership checked by the regex above
    buffer = (buffer << 6) | B64_LOOKUP.get(char)!;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[index++] = (buffer >> bits) & 0xff;
    }
  }
  return out;
}

function deriveKek(passcode: string, salt: Uint8Array, kdf: KdfParams): Uint8Array {
  return scrypt(passcode, salt, {
    N: kdf.n,
    r: kdf.r,
    p: kdf.p,
    dkLen: KEY_LENGTH,
  });
}

function encrypt(key: Uint8Array, plaintext: Uint8Array): CipherBlob {
  const nonce = randomBytes(NONCE_LENGTH);
  return {
    nonce: toBase64(nonce),
    ciphertext: toBase64(gcm(key, nonce).encrypt(plaintext)),
  };
}

/** Throws `InvalidPasscodeError` on GCM auth failure (wrong key or tamper). */
function decrypt(key: Uint8Array, blob: CipherBlob): Uint8Array {
  const nonce = fromBase64(blob.nonce);
  const ciphertext = fromBase64(blob.ciphertext);
  try {
    return gcm(key, nonce).decrypt(ciphertext);
  } catch {
    throw new InvalidPasscodeError();
  }
}

function isCipherBlob(value: unknown): value is CipherBlob {
  const blob = value as CipherBlob | null;
  return (
    typeof blob === 'object' &&
    blob !== null &&
    typeof blob.nonce === 'string' &&
    typeof blob.ciphertext === 'string'
  );
}

/** Parses and shape-checks a persisted envelope. */
export function parseEnvelope(raw: string): VaultEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new VaultCorruptedError('Vault envelope is not valid JSON');
  }
  const envelope = parsed as VaultEnvelope | null;
  if (
    typeof envelope !== 'object' ||
    envelope === null ||
    envelope.version !== 2 ||
    typeof envelope.kdf !== 'object' ||
    envelope.kdf === null ||
    envelope.kdf.algo !== 'scrypt' ||
    typeof envelope.kdf.salt !== 'string' ||
    typeof envelope.kdf.n !== 'number' ||
    typeof envelope.kdf.r !== 'number' ||
    typeof envelope.kdf.p !== 'number' ||
    !isCipherBlob(envelope.wrappedKey) ||
    !isCipherBlob(envelope.data)
  ) {
    throw new VaultCorruptedError('Vault envelope has an unexpected shape');
  }
  return envelope;
}

export function serializeEnvelope(envelope: VaultEnvelope): string {
  return JSON.stringify(envelope);
}

/** Builds a fresh envelope wrapping `vaultKey` under `passcode`. */
export function createEnvelope(
  passcode: string,
  vaultKey: Uint8Array,
  data: VaultData,
  kdf: KdfParams = DEFAULT_KDF_PARAMS,
): VaultEnvelope {
  const salt = randomBytes(SALT_LENGTH);
  const kek = deriveKek(passcode, salt, kdf);
  const envelope: VaultEnvelope = {
    version: 2,
    kdf: { algo: 'scrypt', salt: toBase64(salt), n: kdf.n, r: kdf.r, p: kdf.p },
    wrappedKey: encrypt(kek, vaultKey),
    data: encrypt(vaultKey, utf8ToBytes(JSON.stringify(data))),
  };
  kek.fill(0);
  return envelope;
}

/** Unwraps the vault key. Throws `InvalidPasscodeError` on a wrong passcode. */
export function unwrapVaultKey(envelope: VaultEnvelope, passcode: string): Uint8Array {
  const salt = fromBase64(envelope.kdf.salt);
  const kek = deriveKek(passcode, salt, envelope.kdf);
  try {
    return decrypt(kek, envelope.wrappedKey);
  } finally {
    kek.fill(0);
  }
}

/** Decrypts the data blob. Throws `InvalidPasscodeError` on a wrong vault key. */
export function decryptVaultData(envelope: VaultEnvelope, vaultKey: Uint8Array): VaultData {
  const plaintext = decrypt(vaultKey, envelope.data);
  let data: VaultData;
  try {
    data = JSON.parse(bytesToUtf8(plaintext)) as VaultData;
  } catch {
    throw new VaultCorruptedError('Vault data is not valid JSON');
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    data.version !== 2 ||
    !Array.isArray(data.wallets) ||
    (data.activeWalletId !== null && typeof data.activeWalletId !== 'string')
  ) {
    throw new VaultCorruptedError('Vault data has an unexpected shape');
  }
  return data;
}

/** Re-encrypts the data blob with a fresh nonce, keeping the wrapped key. */
export function encryptVaultData(
  envelope: VaultEnvelope,
  vaultKey: Uint8Array,
  data: VaultData,
): VaultEnvelope {
  return {
    ...envelope,
    data: encrypt(vaultKey, utf8ToBytes(JSON.stringify(data))),
  };
}

/** Rewraps the same vault key under a new passcode with a fresh salt + KEK. */
export function rewrapVaultKey(
  envelope: VaultEnvelope,
  vaultKey: Uint8Array,
  passcode: string,
  kdf: KdfParams = DEFAULT_KDF_PARAMS,
): VaultEnvelope {
  const salt = randomBytes(SALT_LENGTH);
  const kek = deriveKek(passcode, salt, kdf);
  const envelope2: VaultEnvelope = {
    ...envelope,
    kdf: { algo: 'scrypt', salt: toBase64(salt), n: kdf.n, r: kdf.r, p: kdf.p },
    wrappedKey: encrypt(kek, vaultKey),
  };
  kek.fill(0);
  return envelope2;
}
