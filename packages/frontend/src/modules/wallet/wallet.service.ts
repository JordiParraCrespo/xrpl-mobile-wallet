import {
  type Balance,
  type ChainAdapter,
  type ChainRegistry,
  parseUnits,
  type TxResult,
} from "@flama/chain-core";
import type {
  CreateWalletOptions,
  KeyringManager,
  WalletMeta,
} from "@flama/wallet-keyring";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import { AppError, type ErrorDefinition } from "../core/errors";
import { WalletErrors } from "./wallet.errors";
import type { WalletAccount, WalletInfo, WalletStore } from "./wallet.state";

/**
 * Keyring failures mapped by error NAME, never `instanceof` — the keyring
 * package is built separately, so its error classes may not be the same
 * constructor identity at runtime.
 */
const KEYRING_ERRORS: Record<string, ErrorDefinition> = {
  InvalidMnemonicError: WalletErrors.INVALID_MNEMONIC,
  InvalidFamilySeedError: WalletErrors.INVALID_FAMILY_SEED,
  InvalidSecretNumbersError: WalletErrors.INVALID_SECRET_NUMBERS,
  KeyringLockedError: WalletErrors.WALLET_LOCKED,
  UnsupportedChainError: WalletErrors.UNSUPPORTED_CHAIN,
  WalletNotFoundError: WalletErrors.NOT_INITIALIZED,
};

/** Translates keyring errors into wallet AppErrors; anything else (ChainError, …) passes through. */
function toWalletError(error: unknown): Error {
  if (error instanceof Error) {
    const definition = KEYRING_ERRORS[error.name];
    return definition ? new AppError(definition) : error;
  }
  return new Error(String(error));
}

function toWalletInfo(meta: WalletMeta): WalletInfo {
  return {
    id: meta.id,
    name: meta.name,
    type: meta.type,
    chains: [...meta.chains],
    backedUp: meta.backedUp,
  };
}

@injectable()
export class WalletService {
  constructor(
    @inject(TOKENS.KeyringManager)
    private readonly keyring: KeyringManager,
    @inject(TOKENS.ChainRegistry)
    private readonly chains: ChainRegistry,
    @inject(TOKENS.WalletStore)
    public readonly store: WalletStore,
  ) {}

  /** Loads the vault state from secure storage and derives chain accounts. */
  async restore(): Promise<void> {
    if (!(await this.keyring.isInitialized())) {
      this.setEmptyState("no_wallet");
      return;
    }
    if (!this.keyring.isUnlocked) {
      this.setEmptyState("locked");
      return;
    }
    this.syncFromKeyring();
  }

  /** Generates a fresh recovery phrase. Persists nothing until {@link importMnemonic}. */
  generateMnemonic(wordCount: 12 | 24 = 12): string {
    return this.keyring.generateMnemonic(wordCount);
  }

  async createWallet(options?: CreateWalletOptions): Promise<WalletInfo> {
    const meta = await this.wrap(() => this.keyring.createWallet(options));
    this.syncFromKeyring();
    return toWalletInfo(meta);
  }

  async importMnemonic(mnemonic: string, name?: string): Promise<WalletInfo> {
    const meta = await this.wrap(() =>
      this.keyring.importMnemonic(mnemonic, name),
    );
    this.syncFromKeyring();
    return toWalletInfo(meta);
  }

  async importFamilySeed(seed: string, name?: string): Promise<WalletInfo> {
    const meta = await this.wrap(() =>
      this.keyring.importFamilySeed(seed, name),
    );
    this.syncFromKeyring();
    return toWalletInfo(meta);
  }

  async importSecretNumbers(
    rows: string[],
    name?: string,
  ): Promise<WalletInfo> {
    const meta = await this.wrap(() =>
      this.keyring.importSecretNumbers(rows, name),
    );
    this.syncFromKeyring();
    return toWalletInfo(meta);
  }

  async setActiveWallet(id: string): Promise<void> {
    await this.wrap(() => this.keyring.setActiveWallet(id));
    this.syncFromKeyring();
  }

  async renameWallet(id: string, name: string): Promise<void> {
    await this.wrap(() => this.keyring.renameWallet(id, name));
    this.syncFromKeyring();
  }

  async removeWallet(id: string): Promise<void> {
    await this.wrap(() => this.keyring.removeWallet(id));
    this.syncFromKeyring();
  }

  async markBackedUp(id: string): Promise<void> {
    await this.wrap(() => this.keyring.markBackedUp(id));
    this.syncFromKeyring();
  }

  /** Reveals the recovery phrase. Defaults to the active wallet. */
  exportMnemonic(walletId?: string): string {
    const id = walletId ?? this.requireActiveWallet().id;
    return this.wrapSync(() => this.keyring.exportMnemonic(id));
  }

  /** Reveals the XRPL family seed. Defaults to the active wallet. */
  exportFamilySeed(walletId?: string): string {
    const id = walletId ?? this.requireActiveWallet().id;
    return this.wrapSync(() => this.keyring.exportFamilySeed(id));
  }

  async getBalance(chainId: string): Promise<Balance> {
    const { adapter, account } = this.getActiveAccount(chainId);
    return adapter.getBalance(account.address);
  }

  /** Sends `amount` (human-readable decimal string) of the native asset. */
  async send(chainId: string, to: string, amount: string): Promise<TxResult> {
    const { adapter, account, wallet } = this.getActiveAccount(chainId);
    if (!adapter.isValidAddress(to)) {
      throw new AppError(WalletErrors.INVALID_ADDRESS);
    }
    const signer = this.wrapSync(() =>
      this.keyring.getSigner(wallet.id, adapter.config.kind),
    );
    return adapter.transfer(
      {
        from: account.address,
        to,
        amount: parseUnits(amount, adapter.config.nativeCurrency.decimals),
      },
      signer,
    );
  }

  /** Asks a test-network faucet to fund the active wallet's account. */
  async requestFaucetFunds(chainId: string): Promise<void> {
    const { adapter, account } = this.getActiveAccount(chainId);
    if (!adapter.requestFaucet) {
      throw new AppError(WalletErrors.FAUCET_UNAVAILABLE);
    }
    await adapter.requestFaucet(account.address);
  }

  async reset(): Promise<void> {
    await this.wrap(() => this.keyring.reset());
    this.setEmptyState("no_wallet");
  }

  /** Rebuilds the store from the keyring: wallet list + accounts for the active wallet. */
  private syncFromKeyring(): void {
    const wallets = this.keyring.getWallets().map(toWalletInfo);
    const active = this.keyring.getActiveWallet();
    if (!active) {
      this.store.setState({
        status: "no_wallet",
        wallets,
        activeWalletId: null,
        accounts: [],
      });
      return;
    }
    const accounts: WalletAccount[] = this.chains
      .list()
      .filter((adapter) => active.chains.includes(adapter.config.kind))
      .map((adapter) => {
        const signer = this.wrapSync(() =>
          this.keyring.getSigner(active.id, adapter.config.kind),
        );
        return {
          chainId: adapter.config.chainId,
          kind: adapter.config.kind,
          chainName: adapter.config.name,
          symbol: adapter.config.nativeCurrency.symbol,
          address: adapter.deriveAddress(signer.publicKey),
        };
      });
    this.store.setState({
      status: "ready",
      wallets,
      activeWalletId: active.id,
      accounts,
    });
  }

  private setEmptyState(status: "no_wallet" | "locked"): void {
    this.store.setState({
      status,
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });
  }

  private getAdapter(chainId: string): ChainAdapter {
    try {
      return this.chains.get(chainId);
    } catch {
      throw new AppError(WalletErrors.UNKNOWN_CHAIN);
    }
  }

  private requireActiveWallet(): WalletMeta {
    if (this.store.getState().status === "locked") {
      throw new AppError(WalletErrors.WALLET_LOCKED);
    }
    const wallet = this.keyring.getActiveWallet();
    if (!wallet) {
      throw new AppError(WalletErrors.NOT_INITIALIZED);
    }
    return wallet;
  }

  /** Resolves the active wallet's account on `chainId`, enforcing lock + chain support. */
  private getActiveAccount(chainId: string): {
    adapter: ChainAdapter;
    account: WalletAccount;
    wallet: WalletMeta;
  } {
    const adapter = this.getAdapter(chainId);
    const wallet = this.requireActiveWallet();
    if (!wallet.chains.includes(adapter.config.kind)) {
      throw new AppError(WalletErrors.UNSUPPORTED_CHAIN);
    }
    const account = this.store
      .getState()
      .accounts.find((a) => a.chainId === chainId);
    if (!account) {
      throw new AppError(WalletErrors.UNKNOWN_CHAIN);
    }
    return { adapter, account, wallet };
  }

  private async wrap<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      throw toWalletError(error);
    }
  }

  private wrapSync<T>(run: () => T): T {
    try {
      return run();
    } catch (error) {
      throw toWalletError(error);
    }
  }
}
