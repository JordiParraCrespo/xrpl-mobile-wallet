import {
  type Balance,
  type Block,
  type ChainAdapter,
  ChainError,
  ChainErrors,
  formatUnits,
  type NetworkConfig,
  parseUnits,
  type Signer,
  type TokenBalance,
  type TokenInfo,
  type TokenTransferParams,
  type TransferParams,
  type TxResult,
} from '@flama/chain-core';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, concatBytes, hexToBytes } from '@noble/hashes/utils';
import { isValidClassicAddress } from 'ripple-address-codec';
import { encode, encodeForSigning } from 'ripple-binary-codec';
import { deriveAddress } from 'ripple-keypairs';
import { xrplResultToError, xrplRpcError } from './errors';
import { XrplRpcClient } from './rpc';

/** 'TXN\0' — prefix used to compute the hash of a signed transaction. */
const TXN_HASH_PREFIX = new Uint8Array([0x54, 0x58, 0x4e, 0x00]);
const BASE_FEE_DROPS = '12';
const LEDGER_BUFFER = 20;
const POLL_INTERVAL_MS = 2_000;
const DEFAULT_RECENT_BLOCKS = 10;
/** Seconds between the unix epoch (1970) and the XRPL/Ripple epoch (2000). */
const RIPPLE_EPOCH_OFFSET = 946_684_800;
/**
 * Issued currencies on XRPL carry no on-ledger `decimals` — balances are
 * arbitrary-precision decimal strings (up to 15 significant digits). We pin a
 * fixed scale so token amounts share the common `bigint` base-unit shape the
 * adapter interface uses, round-tripping through {@link parseUnits}/{@link formatUnits}.
 */
const XRPL_TOKEN_DECIMALS = 15;

const sha512half = (data: Uint8Array): Uint8Array => sha512(data).slice(0, 32);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Human-readable name for a trustline currency. Standard 3-char ISO codes are
 * already display-ready (no extra name); 40-char hex codes pack a longer ASCII
 * label padded with trailing zeros, which we decode for display.
 */
function decodeCurrency(currency: string): string | undefined {
  if (!/^[0-9A-Fa-f]{40}$/.test(currency)) {
    return undefined;
  }
  const bytes = hexToBytes(currency);
  const ascii = new TextDecoder().decode(bytes).replace(/\0+$/, '').trim();
  return ascii || undefined;
}

interface AccountInfoResult {
  error?: string;
  error_message?: string;
  account_data?: { Balance: string; Sequence: number };
}

interface LedgerCurrentResult {
  ledger_current_index: number;
  error?: string;
}

interface AccountLine {
  /** Issuer (counterparty) classic address. */
  account: string;
  /** Currency code: 3-char ISO or 40-char hex. */
  currency: string;
  /** Holder's balance as a signed decimal string. */
  balance: string;
}

interface AccountLinesResult {
  error?: string;
  error_message?: string;
  lines?: AccountLine[];
}

/** XRPL Payment `Amount` field for an issued currency. */
interface IouAmount {
  currency: string;
  issuer: string;
  value: string;
}

interface LedgerResult {
  error?: string;
  error_message?: string;
  ledger_index: number;
  ledger: {
    ledger_hash: string;
    close_time: number;
    transactions?: string[];
  };
}

interface SubmitResult {
  error?: string;
  error_message?: string;
  engine_result?: string;
  engine_result_message?: string;
}

interface TxLookupResult {
  error?: string;
  error_message?: string;
  validated?: boolean;
  meta?: { TransactionResult?: string };
}

export class XrplAdapter implements ChainAdapter {
  private readonly rpc: XrplRpcClient;

  constructor(readonly config: NetworkConfig) {
    this.rpc = new XrplRpcClient(config.rpcUrl, config.chainId);
  }

  deriveAddress(publicKey: Uint8Array): string {
    return deriveAddress(bytesToHex(publicKey));
  }

  isValidAddress(address: string): boolean {
    return isValidClassicAddress(address);
  }

  async getBalance(address: string): Promise<Balance> {
    const { symbol, decimals } = this.config.nativeCurrency;
    const result = await this.rpc.request<AccountInfoResult>('account_info', {
      account: address,
      ledger_index: 'validated',
    });
    if (result.error === 'actNotFound') {
      // Unfunded accounts do not exist on ledger yet.
      return { symbol, decimals, amount: 0n, formatted: '0' };
    }
    if (result.error || !result.account_data) {
      throw xrplRpcError(
        result.error ?? 'account_info failed',
        result.error_message,
        this.config.chainId,
      );
    }
    const amount = BigInt(result.account_data.Balance);
    return {
      symbol,
      decimals,
      amount,
      formatted: formatUnits(amount, decimals),
    };
  }

  async getRecentBlocks(limit = DEFAULT_RECENT_BLOCKS): Promise<Block[]> {
    const count = Math.max(1, Math.floor(limit));
    const latest = await this.rpc.request<LedgerResult>('ledger', {
      ledger_index: 'validated',
      transactions: true,
    });
    const newest = latest.ledger_index;
    const older = await Promise.all(
      Array.from({ length: count - 1 }, (_, i) => newest - i - 1)
        .filter((index) => index > 0)
        .map((index) =>
          this.rpc.request<LedgerResult>('ledger', {
            ledger_index: index,
            transactions: true,
          }),
        ),
    );
    return [latest, ...older].map((result) => this.toBlock(result));
  }

  async transfer(params: TransferParams, signer: Signer): Promise<TxResult> {
    // Native XRP: `Amount` is a string count of drops.
    return this.sendPayment(params.from, params.to, params.amount.toString(), signer);
  }

  async listTokens(address: string): Promise<TokenBalance[]> {
    const result = await this.rpc.request<AccountLinesResult>('account_lines', {
      account: address,
      ledger_index: 'validated',
    });
    if (result.error === 'actNotFound') {
      // Unfunded accounts hold no trustlines yet.
      return [];
    }
    if (result.error || !result.lines) {
      throw xrplRpcError(
        result.error ?? 'account_lines failed',
        result.error_message,
        this.config.chainId,
      );
    }
    return (
      result.lines
        // A holder's balance is positive; negative lines are the issuer side.
        .filter((line) => !line.balance.startsWith('-') && line.balance !== '0')
        .map((line) => this.toTokenBalance(line.currency, line.account, line.balance))
    );
  }

  async getTokenBalance(address: string, token: TokenInfo): Promise<TokenBalance> {
    const result = await this.rpc.request<AccountLinesResult>('account_lines', {
      account: address,
      peer: token.issuer,
      ledger_index: 'validated',
    });
    const zero = this.toTokenBalance(token.symbol, token.issuer, '0');
    if (result.error === 'actNotFound') {
      return zero;
    }
    if (result.error || !result.lines) {
      throw xrplRpcError(
        result.error ?? 'account_lines failed',
        result.error_message,
        this.config.chainId,
      );
    }
    const line = result.lines.find((l) => l.currency === token.symbol);
    if (!line || line.balance.startsWith('-')) {
      return zero;
    }
    return this.toTokenBalance(line.currency, line.account, line.balance);
  }

  async transferToken(params: TokenTransferParams, signer: Signer): Promise<TxResult> {
    const amount: IouAmount = {
      currency: params.token.symbol,
      issuer: params.token.issuer,
      value: formatUnits(params.amount, params.token.decimals),
    };
    return this.sendPayment(params.from, params.to, amount, signer);
  }

  /**
   * Shared Payment pipeline for native XRP and issued currencies: load the
   * sequence, sign through the external signer, submit, and await validation.
   * `amount` is a drops string for XRP or an {@link IouAmount} object for tokens.
   */
  private async sendPayment(
    from: string,
    to: string,
    amount: string | IouAmount,
    signer: Signer,
  ): Promise<TxResult> {
    const accountInfo = await this.rpc.request<AccountInfoResult>('account_info', {
      account: from,
      ledger_index: 'current',
    });
    if (accountInfo.error || !accountInfo.account_data) {
      throw xrplRpcError(
        accountInfo.error ?? 'account_info failed',
        accountInfo.error_message,
        this.config.chainId,
      );
    }
    const ledger = await this.rpc.request<LedgerCurrentResult>('ledger_current');
    const lastLedgerSequence = ledger.ledger_current_index + LEDGER_BUFFER;

    let blob: string;
    try {
      blob = await this.signPayment(
        {
          TransactionType: 'Payment',
          Account: from,
          Destination: to,
          Amount: amount,
          Fee: BASE_FEE_DROPS,
          Sequence: accountInfo.account_data.Sequence,
          LastLedgerSequence: lastLedgerSequence,
        },
        signer,
      );
    } catch (cause) {
      throw new ChainError(ChainErrors.SIGNING_FAILED, {
        chainId: this.config.chainId,
        cause,
      });
    }
    const hash = bytesToHex(
      sha512half(concatBytes(TXN_HASH_PREFIX, hexToBytes(blob))),
    ).toUpperCase();

    const submit = await this.rpc.request<SubmitResult>('submit', {
      tx_blob: blob,
    });
    if (submit.error) {
      throw xrplRpcError(submit.error, submit.error_message, this.config.chainId);
    }
    const engineResult = submit.engine_result ?? '';
    // tes = applied to open ledger; ter = retriable, may still make it in.
    if (engineResult !== 'tesSUCCESS' && !engineResult.startsWith('ter')) {
      return {
        hash,
        success: false,
        error: `${engineResult}: ${submit.engine_result_message ?? ''}`.trim(),
        code: xrplResultToError(engineResult).code,
        explorerUrl: this.explorerUrl(hash),
      };
    }
    return this.waitForValidation(hash, lastLedgerSequence);
  }

  private toTokenBalance(currency: string, issuer: string, balance: string): TokenBalance {
    const value = balance.startsWith('-') ? balance.slice(1) : balance;
    const amount = parseUnits(value, XRPL_TOKEN_DECIMALS);
    return {
      symbol: currency,
      issuer,
      decimals: XRPL_TOKEN_DECIMALS,
      name: decodeCurrency(currency),
      amount,
      formatted: formatUnits(amount, XRPL_TOKEN_DECIMALS),
    };
  }

  /**
   * External-signer pipeline: serialize for signing, sha512-half digest,
   * sign through the keyring Signer, then attach the DER signature.
   */
  private async signPayment(tx: Record<string, unknown>, signer: Signer): Promise<string> {
    tx.SigningPubKey = bytesToHex(signer.publicKey).toUpperCase();
    const digest = sha512half(hexToBytes(encodeForSigning(tx)));
    const { signature } = await signer.signDigest(digest);
    tx.TxnSignature = secp256k1.Signature.fromCompact(signature).toDERHex().toUpperCase();
    return encode(tx);
  }

  private async waitForValidation(hash: string, lastLedgerSequence: number): Promise<TxResult> {
    const explorerUrl = this.explorerUrl(hash);
    for (;;) {
      await sleep(POLL_INTERVAL_MS);
      const tx = await this.rpc.request<TxLookupResult>('tx', {
        transaction: hash,
      });
      if (tx.validated) {
        const code = tx.meta?.TransactionResult;
        if (code === 'tesSUCCESS') {
          return { hash, success: true, explorerUrl };
        }
        return {
          hash,
          success: false,
          error: code,
          code: (code ? xrplResultToError(code) : ChainErrors.TRANSACTION_FAILED).code,
          explorerUrl,
        };
      }
      if (tx.error && tx.error !== 'txnNotFound') {
        throw xrplRpcError(tx.error, tx.error_message, this.config.chainId);
      }
      const ledger = await this.rpc.request<LedgerCurrentResult>('ledger_current');
      if (ledger.ledger_current_index > lastLedgerSequence) {
        return {
          hash,
          success: false,
          error: 'Transaction expired without being validated',
          code: ChainErrors.TRANSACTION_EXPIRED.code,
          explorerUrl,
        };
      }
    }
  }

  private toBlock(result: LedgerResult): Block {
    return {
      height: result.ledger_index,
      hash: result.ledger.ledger_hash,
      timestamp: result.ledger.close_time + RIPPLE_EPOCH_OFFSET,
      transactionCount: result.ledger.transactions?.length ?? 0,
    };
  }

  private explorerUrl(hash: string): string | undefined {
    return this.config.explorerUrl ? `${this.config.explorerUrl}/transactions/${hash}` : undefined;
  }
}
