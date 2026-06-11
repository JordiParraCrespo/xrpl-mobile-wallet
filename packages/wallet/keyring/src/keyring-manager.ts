import type { ChainKind, Signer } from '@flama/chain-core';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { derivationPath } from './derivation';
import {
  InvalidMnemonicError,
  KeyringLockedError,
  UnsupportedChainError,
  VaultCorruptedError,
  WalletNotFoundError,
} from './errors';
import { Secp256k1Signer } from './signer';
import type { SecureStorage } from './storage';
import {
  createEnvelope,
  DEFAULT_KDF_PARAMS,
  decryptVaultData,
  encryptVaultData,
  type KdfParams,
  LEGACY_VAULT_STORAGE_KEY,
  parseEnvelope,
  rewrapVaultKey,
  serializeEnvelope,
  unwrapVaultKey,
  VAULT_STORAGE_KEY,
  type VaultData,
  type VaultEnvelope,
  type VaultWallet,
} from './vault';
import {
  createFamilySeedSigner,
  InvalidFamilySeedError,
  isValidFamilySeed,
} from './xrpl/family-seed';
import { secretNumbersToFamilySeed } from './xrpl/secret-numbers';

export type WalletType = 'hd' | 'xrpl-seed';

export interface WalletMeta {
  id: string;
  name: string;
  type: WalletType;
  chains: ChainKind[];
  backedUp: boolean;
  createdAt: number;
}

export interface CreateWalletOptions {
  name?: string;
  words?: 12 | 24;
}

interface LegacyVault {
  version: 1;
  wallets: { id: string; name: string; type: 'hd'; mnemonic: string }[];
}

const CHAINS_BY_TYPE: Record<WalletType, ChainKind[]> = {
  hd: ['xrpl', 'evm'],
  'xrpl-seed': ['xrpl'],
};

/**
 * Owns all key material. Secrets live in an AES-256-GCM encrypted vault
 * behind a passcode-derived KEK (see `vault.ts`); the decrypted vault and
 * vault key are held in memory only while unlocked. Private keys never
 * leave this package — chain adapters only ever see a `Signer`.
 */
export class KeyringManager {
  private vaultKey: Uint8Array | null = null;
  private envelope: VaultEnvelope | null = null;
  private data: VaultData | null = null;

  constructor(
    private readonly storage: SecureStorage,
    private readonly kdf: KdfParams = DEFAULT_KDF_PARAMS,
  ) {}

  /** Whether a v2 encrypted vault exists in storage. */
  async isInitialized(): Promise<boolean> {
    return (await this.storage.get(VAULT_STORAGE_KEY)) !== null;
  }

  /** Whether a legacy v1 plaintext vault exists in storage. */
  async hasLegacyVault(): Promise<boolean> {
    return (await this.storage.get(LEGACY_VAULT_STORAGE_KEY)) !== null;
  }

  get isUnlocked(): boolean {
    return this.vaultKey !== null;
  }

  /**
   * Creates the v2 vault and leaves the keyring unlocked. If a legacy v1
   * vault exists its wallets are migrated in (marked backed up, first one
   * active) and the legacy key is removed.
   */
  async initialize(passcode: string): Promise<void> {
    if (await this.isInitialized()) {
      throw new Error('Keyring is already initialized');
    }
    const wallets: VaultWallet[] = [];
    const legacyRaw = await this.storage.get(LEGACY_VAULT_STORAGE_KEY);
    if (legacyRaw) {
      let legacy: LegacyVault;
      try {
        legacy = JSON.parse(legacyRaw) as LegacyVault;
        if (!Array.isArray(legacy.wallets)) throw new Error('missing wallets');
      } catch {
        throw new VaultCorruptedError('Legacy vault is corrupted');
      }
      const now = Date.now();
      for (const wallet of legacy.wallets) {
        wallets.push({
          id: wallet.id,
          name: wallet.name,
          type: 'hd',
          mnemonic: wallet.mnemonic,
          backedUp: true,
          createdAt: now,
        });
      }
    }
    const data: VaultData = {
      version: 2,
      wallets,
      activeWalletId: wallets[0]?.id ?? null,
    };
    const vaultKey = randomBytes(32);
    const envelope = createEnvelope(passcode, vaultKey, data, this.kdf);
    await this.storage.set(VAULT_STORAGE_KEY, serializeEnvelope(envelope));
    if (legacyRaw) {
      await this.storage.remove(LEGACY_VAULT_STORAGE_KEY);
    }
    this.vaultKey = vaultKey;
    this.envelope = envelope;
    this.data = data;
  }

  /** Unlocks with the passcode. `InvalidPasscodeError` | `VaultCorruptedError`. */
  async unlock(passcode: string): Promise<void> {
    const envelope = await this.loadEnvelope();
    const vaultKey = unwrapVaultKey(envelope, passcode);
    this.data = decryptVaultData(envelope, vaultKey);
    this.vaultKey = vaultKey;
    this.envelope = envelope;
  }

  /** Unlocks with the raw vault key (biometric path). Wrong key → `InvalidPasscodeError`. */
  async unlockWithKey(vaultKey: Uint8Array): Promise<void> {
    const envelope = await this.loadEnvelope();
    this.data = decryptVaultData(envelope, vaultKey);
    this.vaultKey = new Uint8Array(vaultKey);
    this.envelope = envelope;
  }

  /** Copy of the raw vault key (for biometric enrollment) while unlocked. */
  getVaultKey(): Uint8Array {
    const { vaultKey } = this.unlocked();
    return new Uint8Array(vaultKey);
  }

  /** Drops the in-memory key and decrypted vault (best-effort zeroing). */
  lock(): void {
    this.vaultKey?.fill(0);
    this.vaultKey = null;
    this.envelope = null;
    this.data = null;
  }

  /** Verifies `current`, then rewraps the same vault key with a fresh salt + KEK. */
  async changePasscode(current: string, next: string): Promise<void> {
    const envelope = await this.loadEnvelope();
    const vaultKey = unwrapVaultKey(envelope, current);
    const rewrapped = rewrapVaultKey(envelope, vaultKey, next, this.kdf);
    vaultKey.fill(0);
    await this.storage.set(VAULT_STORAGE_KEY, serializeEnvelope(rewrapped));
    if (this.isUnlocked) {
      this.envelope = rewrapped;
    }
  }

  getWallets(): WalletMeta[] {
    return this.unlocked().data.wallets.map(toMeta);
  }

  getActiveWallet(): WalletMeta | null {
    const { data } = this.unlocked();
    const wallet = data.wallets.find((w) => w.id === data.activeWalletId);
    return wallet ? toMeta(wallet) : null;
  }

  async setActiveWallet(walletId: string): Promise<void> {
    const { data } = this.unlocked();
    this.findWallet(walletId);
    data.activeWalletId = walletId;
    await this.persist();
  }

  /** Generates a fresh mnemonic (12 words by default) and makes it active. */
  async createWallet(options?: CreateWalletOptions): Promise<WalletMeta> {
    this.unlocked();
    const mnemonic = generateMnemonic(wordlist, options?.words === 24 ? 256 : 128);
    return this.addWallet({ type: 'hd', mnemonic, backedUp: false }, options?.name);
  }

  /** Imports a BIP-39 mnemonic and makes it active. */
  async importMnemonic(mnemonic: string, name?: string): Promise<WalletMeta> {
    const { data } = this.unlocked();
    const normalized = mnemonic.trim().toLowerCase().split(/\s+/).join(' ');
    if (!validateMnemonic(normalized, wordlist)) {
      throw new InvalidMnemonicError();
    }
    if (data.wallets.some((w) => w.type === 'hd' && w.mnemonic === normalized)) {
      throw new Error('A wallet with this mnemonic already exists');
    }
    return this.addWallet({ type: 'hd', mnemonic: normalized, backedUp: true }, name);
  }

  /** Imports an XRPL family seed (secp256k1 or `sEd…` ed25519) and makes it active. */
  async importFamilySeed(seed: string, name?: string): Promise<WalletMeta> {
    const { data } = this.unlocked();
    const normalized = seed.trim();
    if (!isValidFamilySeed(normalized)) {
      throw new InvalidFamilySeedError();
    }
    if (data.wallets.some((w) => w.type === 'xrpl-seed' && w.seed === normalized)) {
      throw new Error('A wallet with this family seed already exists');
    }
    return this.addWallet({ type: 'xrpl-seed', seed: normalized, backedUp: true }, name);
  }

  /** Imports Xaman secret numbers, stored as the family seed they encode. */
  async importSecretNumbers(rows: string[], name?: string): Promise<WalletMeta> {
    this.unlocked();
    return this.importFamilySeed(secretNumbersToFamilySeed(rows), name);
  }

  async renameWallet(walletId: string, name: string): Promise<void> {
    this.findWallet(walletId).name = name;
    await this.persist();
  }

  /** Removes a wallet; if it was active, the first remaining one becomes active. */
  async removeWallet(walletId: string): Promise<void> {
    const { data } = this.unlocked();
    this.findWallet(walletId);
    data.wallets = data.wallets.filter((w) => w.id !== walletId);
    if (data.activeWalletId === walletId) {
      data.activeWalletId = data.wallets[0]?.id ?? null;
    }
    await this.persist();
  }

  async markBackedUp(walletId: string): Promise<void> {
    this.findWallet(walletId).backedUp = true;
    await this.persist();
  }

  /** HD wallets only — `UnsupportedChainError` for family-seed wallets. */
  exportMnemonic(walletId: string): string {
    const wallet = this.findWallet(walletId);
    if (wallet.type !== 'hd') {
      throw new UnsupportedChainError('Wallet has no mnemonic to export');
    }
    return wallet.mnemonic;
  }

  /** Family-seed wallets only — `UnsupportedChainError` for HD wallets. */
  exportFamilySeed(walletId: string): string {
    const wallet = this.findWallet(walletId);
    if (wallet.type !== 'xrpl-seed') {
      throw new UnsupportedChainError('Wallet has no family seed to export');
    }
    return wallet.seed;
  }

  /**
   * HD wallets derive a secp256k1 signer at the chain's BIP-44 path;
   * family-seed wallets only sign for XRPL via XRPL key derivation.
   */
  getSigner(walletId: string, kind: ChainKind, accountIndex = 0): Signer {
    const wallet = this.findWallet(walletId);
    if (wallet.type === 'xrpl-seed') {
      if (kind !== 'xrpl') {
        throw new UnsupportedChainError(`Family seed wallets cannot sign for "${kind}"`);
      }
      return createFamilySeedSigner(wallet.seed);
    }
    const path = derivationPath(kind, accountIndex);
    const seed = mnemonicToSeedSync(wallet.mnemonic);
    const node = HDKey.fromMasterSeed(seed).derive(path);
    seed.fill(0);
    if (!node.privateKey) {
      throw new Error(`Cannot derive a private key for path "${path}"`);
    }
    return new Secp256k1Signer(node.privateKey);
  }

  /** Removes the v2 and legacy vaults from storage and locks. */
  async reset(): Promise<void> {
    await this.storage.remove(VAULT_STORAGE_KEY);
    await this.storage.remove(LEGACY_VAULT_STORAGE_KEY);
    this.lock();
  }

  private unlocked(): {
    data: VaultData;
    vaultKey: Uint8Array;
    envelope: VaultEnvelope;
  } {
    if (!this.vaultKey || !this.data || !this.envelope) {
      throw new KeyringLockedError();
    }
    return {
      data: this.data,
      vaultKey: this.vaultKey,
      envelope: this.envelope,
    };
  }

  private async loadEnvelope(): Promise<VaultEnvelope> {
    const raw = await this.storage.get(VAULT_STORAGE_KEY);
    if (!raw) {
      throw new Error('Keyring is not initialized');
    }
    return parseEnvelope(raw);
  }

  private findWallet(walletId: string): VaultWallet {
    const wallet = this.unlocked().data.wallets.find((w) => w.id === walletId);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }
    return wallet;
  }

  private async addWallet(
    secret:
      | { type: 'hd'; mnemonic: string; backedUp: boolean }
      | { type: 'xrpl-seed'; seed: string; backedUp: boolean },
    name?: string,
  ): Promise<WalletMeta> {
    const { data } = this.unlocked();
    const wallet: VaultWallet = {
      id: bytesToHex(randomBytes(8)),
      name: name ?? `Wallet ${data.wallets.length + 1}`,
      createdAt: Date.now(),
      ...secret,
    };
    data.wallets.push(wallet);
    data.activeWalletId = wallet.id;
    await this.persist();
    return toMeta(wallet);
  }

  /** Re-encrypts the data blob with the in-memory vault key and persists it. */
  private async persist(): Promise<void> {
    const { data, vaultKey, envelope } = this.unlocked();
    this.envelope = encryptVaultData(envelope, vaultKey, data);
    await this.storage.set(VAULT_STORAGE_KEY, serializeEnvelope(this.envelope));
  }
}

function toMeta(wallet: VaultWallet): WalletMeta {
  return {
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    chains: [...CHAINS_BY_TYPE[wallet.type]],
    backedUp: wallet.backedUp,
    createdAt: wallet.createdAt,
  };
}
