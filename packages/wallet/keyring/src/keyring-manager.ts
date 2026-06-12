import type { ChainKind, Signer } from '@flama/chain-core';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { derivationPath } from './derivation';
import {
  InvalidMnemonicError,
  InvalidPasscodeError,
  KeyringLockedError,
  UnsupportedChainError,
  VaultCorruptedError,
  WalletNotFoundError,
} from './errors';
import { Secp256k1Signer } from './signer';
import type { SecureStorage } from './storage';
import {
  createPasscodeVerifier,
  LEGACY_VAULT_STORAGE_KEY,
  PASSCODE_STORAGE_KEY,
  parseVault,
  serializeVault,
  VAULT_STORAGE_KEY,
  type VaultData,
  type VaultWallet,
  verifyPasscode,
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
 * Owns all key material. Secrets live as plaintext JSON in the host's
 * hardware-backed secure store (see `vault.ts`) and are held in memory only
 * while unlocked; the passcode is a UI lock verified against a salted hash, not
 * an encryption key. Private keys never leave this package — chain adapters
 * only ever see a `Signer`.
 */
export class KeyringManager {
  private data: VaultData | null = null;

  constructor(private readonly storage: SecureStorage) {}

  /** Whether a vault exists in storage. */
  async isInitialized(): Promise<boolean> {
    return (await this.storage.get(VAULT_STORAGE_KEY)) !== null;
  }

  /** Whether a legacy v1 vault exists in storage. */
  async hasLegacyVault(): Promise<boolean> {
    return (await this.storage.get(LEGACY_VAULT_STORAGE_KEY)) !== null;
  }

  get isUnlocked(): boolean {
    return this.data !== null;
  }

  /**
   * Creates the vault and passcode and leaves the keyring unlocked. If a legacy
   * v1 vault exists its wallets are migrated in (marked backed up, first one
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
    await this.storage.set(PASSCODE_STORAGE_KEY, createPasscodeVerifier(passcode));
    await this.storage.set(VAULT_STORAGE_KEY, serializeVault(data));
    if (legacyRaw) {
      await this.storage.remove(LEGACY_VAULT_STORAGE_KEY);
    }
    this.data = data;
  }

  /** Unlocks with the passcode. `InvalidPasscodeError` | `VaultCorruptedError`. */
  async unlock(passcode: string): Promise<void> {
    if (!(await this.checkPasscode(passcode))) {
      throw new InvalidPasscodeError();
    }
    this.data = await this.loadVault();
  }

  /**
   * Unlocks without the passcode, for callers that have authenticated the user
   * another way (the security module after a biometric prompt).
   */
  async unlockTrusted(): Promise<void> {
    this.data = await this.loadVault();
  }

  /** Drops the in-memory vault. */
  lock(): void {
    this.data = null;
  }

  /** Verifies `current`, then replaces the passcode verifier. Secrets untouched. */
  async changePasscode(current: string, next: string): Promise<void> {
    if (!(await this.checkPasscode(current))) {
      throw new InvalidPasscodeError();
    }
    await this.storage.set(PASSCODE_STORAGE_KEY, createPasscodeVerifier(next));
  }

  getWallets(): WalletMeta[] {
    return this.unlocked().wallets.map(toMeta);
  }

  getActiveWallet(): WalletMeta | null {
    const data = this.unlocked();
    const wallet = data.wallets.find((w) => w.id === data.activeWalletId);
    return wallet ? toMeta(wallet) : null;
  }

  async setActiveWallet(walletId: string): Promise<void> {
    const data = this.unlocked();
    this.findWallet(walletId);
    data.activeWalletId = walletId;
    await this.persist();
  }

  /**
   * Generates a fresh BIP-39 recovery phrase. Nothing is persisted — call
   * {@link importMnemonic} once the user has backed it up.
   */
  generateMnemonic(wordCount: 12 | 24 = 12): string {
    return generateMnemonic(wordlist, wordCount === 24 ? 256 : 128);
  }

  /** Generates a fresh mnemonic (12 words by default) and makes it active. */
  async createWallet(options?: CreateWalletOptions): Promise<WalletMeta> {
    this.unlocked();
    const mnemonic = generateMnemonic(wordlist, options?.words === 24 ? 256 : 128);
    return this.addWallet({ type: 'hd', mnemonic, backedUp: false }, options?.name);
  }

  /** Imports a BIP-39 mnemonic and makes it active. */
  async importMnemonic(mnemonic: string, name?: string): Promise<WalletMeta> {
    const data = this.unlocked();
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
    const data = this.unlocked();
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
    const data = this.unlocked();
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

  /** Removes the vault, passcode and legacy vault from storage and locks. */
  async reset(): Promise<void> {
    await this.storage.remove(VAULT_STORAGE_KEY);
    await this.storage.remove(PASSCODE_STORAGE_KEY);
    await this.storage.remove(LEGACY_VAULT_STORAGE_KEY);
    this.lock();
  }

  private unlocked(): VaultData {
    if (!this.data) {
      throw new KeyringLockedError();
    }
    return this.data;
  }

  /** Verifies a passcode against the stored verifier. */
  private async checkPasscode(passcode: string): Promise<boolean> {
    const raw = await this.storage.get(PASSCODE_STORAGE_KEY);
    if (!raw) {
      throw new Error('Keyring is not initialized');
    }
    return verifyPasscode(passcode, raw);
  }

  private async loadVault(): Promise<VaultData> {
    const raw = await this.storage.get(VAULT_STORAGE_KEY);
    if (!raw) {
      throw new Error('Keyring is not initialized');
    }
    return parseVault(raw);
  }

  private findWallet(walletId: string): VaultWallet {
    const wallet = this.unlocked().wallets.find((w) => w.id === walletId);
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
    const data = this.unlocked();
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

  /** Writes the in-memory vault back to storage. */
  private async persist(): Promise<void> {
    await this.storage.set(VAULT_STORAGE_KEY, serializeVault(this.unlocked()));
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
