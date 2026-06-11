import {
  type ChainAdapter,
  type ChainRegistry,
  parseUnits,
  type TokenBalance,
  type TokenInfo,
  type TxResult,
} from '@flama/chain-core';
import { derivationPath, type KeyringManager } from '@flama/wallet-keyring';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError } from '../core/errors';
import { TokensErrors } from './tokens.errors';

/**
 * Non-native fungible tokens held by the wallet account: XRPL issued
 * currencies (trustlines) and EVM ERC-20s. Separate from the `wallet` module
 * (native accounts/balance/send) and built on the shared `chain` registry, so
 * adding token support never touches native payment logic.
 */
@injectable()
export class TokensService {
  constructor(
    @inject(TOKENS.KeyringManager)
    private readonly keyring: KeyringManager,
    @inject(TOKENS.ChainRegistry)
    private readonly chains: ChainRegistry,
  ) {}

  /** Tokens held by the wallet's account on `chainId`. */
  async list(chainId: string): Promise<TokenBalance[]> {
    const { adapter, address } = this.account(chainId);
    return adapter.listTokens(address);
  }

  /** Balance of a single token held by the wallet's account on `chainId`. */
  async getBalance(chainId: string, token: TokenInfo): Promise<TokenBalance> {
    const { adapter, address } = this.account(chainId);
    return adapter.getTokenBalance(address, token);
  }

  /** Sends `amount` (human-readable decimal string) of a non-native token. */
  async send(chainId: string, to: string, token: TokenInfo, amount: string): Promise<TxResult> {
    const { adapter, address, signer } = this.account(chainId);
    if (!adapter.isValidAddress(to)) {
      throw new AppError(TokensErrors.INVALID_ADDRESS);
    }
    return adapter.transferToken(
      {
        from: address,
        to,
        token,
        amount: parseUnits(amount, token.decimals),
      },
      signer,
    );
  }

  /** Resolves the adapter, derived account address and signer for a chain. */
  private account(chainId: string) {
    const adapter = this.adapterFor(chainId);
    const wallet = this.keyring.getWallets()[0];
    if (!wallet) {
      throw new AppError(TokensErrors.NOT_INITIALIZED);
    }
    const signer = this.keyring.getSigner(wallet.id, derivationPath(adapter.config.kind, 0));
    return {
      adapter,
      address: adapter.deriveAddress(signer.publicKey),
      signer,
    };
  }

  private adapterFor(chainId: string): ChainAdapter {
    const adapter = this.chains.list().find((a) => a.config.chainId === chainId);
    if (!adapter) {
      throw new AppError(TokensErrors.UNKNOWN_CHAIN);
    }
    return adapter;
  }
}
