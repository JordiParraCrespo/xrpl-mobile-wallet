import {
  type ChainAdapter,
  type ChainRegistry,
  parseUnits,
  type TokenBalance,
  type TokenInfo,
  type TxResult,
} from '@flama/chain-core';
import type { KeyringManager } from '@flama/wallet-keyring';
import { inject, injectable } from 'inversify';
import { TOKENS } from '../../di/tokens';
import { AppError, type ErrorDefinition } from '../core/errors';
import { TokensErrors } from './tokens.errors';

/**
 * Keyring errors are matched by `error.name`, never instanceof — workspace
 * packages resolve each other via built dist, so class identity is unreliable
 * (same rule as WalletService).
 */
const KEYRING_ERRORS: Record<string, ErrorDefinition> = {
  KeyringLockedError: TokensErrors.WALLET_LOCKED,
  WalletNotFoundError: TokensErrors.NOT_INITIALIZED,
};

/** Translates keyring errors into tokens AppErrors; anything else passes through. */
function toTokensError(error: unknown): Error {
  if (error instanceof Error) {
    const definition = KEYRING_ERRORS[error.name];
    return definition ? new AppError(definition) : error;
  }
  return new Error(String(error));
}

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

  /**
   * Registers a token so the wallet account can receive it. On XRPL this opens
   * a trustline to the issuer (TrustSet); `limit` caps how much the account is
   * willing to hold. Chains that need no registration raise
   * `REGISTRATION_NOT_SUPPORTED`.
   */
  async register(chainId: string, token: TokenInfo, limit?: string): Promise<TxResult> {
    const { adapter, address, signer } = this.account(chainId);
    if (!adapter.registerToken) {
      throw new AppError(TokensErrors.REGISTRATION_NOT_SUPPORTED);
    }
    return adapter.registerToken({ from: address, token, limit }, signer);
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
    try {
      const wallet = this.keyring.getActiveWallet();
      if (!wallet) {
        throw new AppError(TokensErrors.NOT_INITIALIZED);
      }
      const signer = this.keyring.getSigner(wallet.id, adapter.config.kind, 0);
      return {
        adapter,
        address: adapter.deriveAddress(signer.publicKey),
        signer,
      };
    } catch (error) {
      throw toTokensError(error);
    }
  }

  private adapterFor(chainId: string): ChainAdapter {
    const adapter = this.chains.list().find((a) => a.config.chainId === chainId);
    if (!adapter) {
      throw new AppError(TokensErrors.UNKNOWN_CHAIN);
    }
    return adapter;
  }
}
