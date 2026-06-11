import {
  type Balance,
  type ChainRegistry,
  parseUnits,
  type TxResult,
} from "@flama/chain-core";
import {
  derivationPath,
  InvalidMnemonicError,
  type KeyringManager,
} from "@flama/wallet-keyring";
import { inject, injectable } from "inversify";
import { TOKENS } from "../../di/tokens";
import { AppError } from "../core/errors";
import { WalletErrors } from "./wallet.errors";
import type { WalletAccount, WalletStore } from "./wallet.state";

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

  /** Loads the vault from secure storage and derives chain accounts. */
  async restore(): Promise<void> {
    await this.keyring.restore();
    this.refreshAccounts();
  }

  /** Generates a fresh recovery phrase. Persists nothing until {@link importMnemonic}. */
  generateMnemonic(wordCount: 12 | 24 = 12): string {
    return this.keyring.generateMnemonic(wordCount);
  }

  async importMnemonic(mnemonic: string): Promise<void> {
    try {
      await this.keyring.importMnemonic(mnemonic);
    } catch (error) {
      if (error instanceof InvalidMnemonicError) {
        throw new AppError(WalletErrors.INVALID_MNEMONIC);
      }
      throw error;
    }
    this.refreshAccounts();
  }

  async getBalance(chainId: string): Promise<Balance> {
    const account = this.getAccount(chainId);
    return this.chains.get(chainId).getBalance(account.address);
  }

  /** Sends `amount` (human-readable decimal string) of the native asset. */
  async send(chainId: string, to: string, amount: string): Promise<TxResult> {
    const account = this.getAccount(chainId);
    const adapter = this.chains.get(chainId);
    if (!adapter.isValidAddress(to)) {
      throw new AppError(WalletErrors.INVALID_ADDRESS);
    }
    const wallet = this.requireWallet();
    const signer = this.keyring.getSigner(
      wallet.id,
      derivationPath(adapter.config.kind, 0),
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

  async reset(): Promise<void> {
    await this.keyring.reset();
    this.refreshAccounts();
  }

  private refreshAccounts(): void {
    const wallet = this.keyring.getWallets()[0];
    if (!wallet) {
      this.store.setState({ status: "no_wallet", accounts: [] });
      return;
    }
    const accounts: WalletAccount[] = this.chains.list().map((adapter) => {
      const signer = this.keyring.getSigner(
        wallet.id,
        derivationPath(adapter.config.kind, 0),
      );
      return {
        chainId: adapter.config.chainId,
        kind: adapter.config.kind,
        chainName: adapter.config.name,
        symbol: adapter.config.nativeCurrency.symbol,
        address: adapter.deriveAddress(signer.publicKey),
      };
    });
    this.store.setState({ status: "ready", accounts });
  }

  private getAccount(chainId: string): WalletAccount {
    const account = this.store
      .getState()
      .accounts.find((a) => a.chainId === chainId);
    if (!account) {
      throw new AppError(WalletErrors.UNKNOWN_CHAIN);
    }
    return account;
  }

  private requireWallet() {
    const wallet = this.keyring.getWallets()[0];
    if (!wallet) {
      throw new AppError(WalletErrors.NOT_INITIALIZED);
    }
    return wallet;
  }
}
