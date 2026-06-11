import type { Signer } from "@flama/chain-core";
import { HDKey } from "@scure/bip32";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { InvalidMnemonicError, WalletNotFoundError } from "./errors";
import { Secp256k1Signer } from "./signer";
import type { SecureStorage } from "./storage";

const VAULT_KEY = "flama.wallet.vault";

interface VaultWallet {
  id: string;
  name: string;
  type: "hd";
  mnemonic: string;
}

interface Vault {
  version: 1;
  wallets: VaultWallet[];
}

export interface WalletMeta {
  id: string;
  name: string;
  type: "hd";
}

const emptyVault = (): Vault => ({ version: 1, wallets: [] });

/**
 * Owns all key material. Mnemonics are persisted through the injected
 * SecureStorage and private keys never leave this package — chain adapters
 * only ever see a `Signer`.
 */
export class KeyringManager {
  private vault: Vault = emptyVault();
  private restored = false;

  constructor(private readonly storage: SecureStorage) {}

  /** Loads the vault from secure storage. Idempotent. */
  async restore(): Promise<void> {
    if (this.restored) return;
    const raw = await this.storage.get(VAULT_KEY);
    if (raw) {
      this.vault = JSON.parse(raw) as Vault;
    }
    this.restored = true;
  }

  get isInitialized(): boolean {
    return this.vault.wallets.length > 0;
  }

  getWallets(): WalletMeta[] {
    return this.vault.wallets.map(({ id, name, type }) => ({ id, name, type }));
  }

  /**
   * Generates a fresh BIP-39 recovery phrase. Nothing is persisted — call
   * {@link importMnemonic} once the user has backed it up.
   */
  generateMnemonic(wordCount: 12 | 24 = 12): string {
    return generateMnemonic(wordlist, wordCount === 24 ? 256 : 128);
  }

  async importMnemonic(mnemonic: string, name?: string): Promise<WalletMeta> {
    const normalized = mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
    if (!validateMnemonic(normalized, wordlist)) {
      throw new InvalidMnemonicError();
    }
    const ordinal = this.vault.wallets.length + 1;
    const wallet: VaultWallet = {
      id: `wallet-${ordinal}`,
      name: name ?? `Wallet ${ordinal}`,
      type: "hd",
      mnemonic: normalized,
    };
    this.vault.wallets.push(wallet);
    await this.persist();
    return { id: wallet.id, name: wallet.name, type: wallet.type };
  }

  /** Derives a signer for a BIP-44 path. */
  getSigner(walletId: string, path: string): Signer {
    const wallet = this.getVaultWallet(walletId);
    const seed = mnemonicToSeedSync(wallet.mnemonic);
    const node = HDKey.fromMasterSeed(seed).derive(path);
    if (!node.privateKey) {
      throw new Error(`Cannot derive a private key for path "${path}"`);
    }
    return new Secp256k1Signer(node.privateKey);
  }

  exportMnemonic(walletId: string): string {
    return this.getVaultWallet(walletId).mnemonic;
  }

  async reset(): Promise<void> {
    this.vault = emptyVault();
    await this.storage.remove(VAULT_KEY);
  }

  private getVaultWallet(walletId: string): VaultWallet {
    const wallet = this.vault.wallets.find((w) => w.id === walletId);
    if (!wallet) {
      throw new WalletNotFoundError(walletId);
    }
    return wallet;
  }

  private async persist(): Promise<void> {
    await this.storage.set(VAULT_KEY, JSON.stringify(this.vault));
  }
}
