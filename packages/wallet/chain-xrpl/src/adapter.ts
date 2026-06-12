import {
  type AccountTxPage,
  type AccountTxQuery,
  type Balance,
  type Block,
  type ChainAdapter,
  ChainError,
  ChainErrors,
  formatUnits,
  type LedgerTransaction,
  type LedgerTxKind,
  type NetworkConfig,
  parseUnits,
  type RegisterTokenParams,
  type Signer,
  type TokenBalance,
  type TokenInfo,
  type TokenTransferParams,
  type TransferParams,
  type TxContext,
  type TxDirection,
  type TxResult,
} from "@flama/chain-core";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils";
import { isValidClassicAddress } from "ripple-address-codec";
import { encode, encodeForSigning } from "ripple-binary-codec";
import { deriveAddress } from "ripple-keypairs";
import { xrplResultToError, xrplRpcError } from "./errors";
import { XrplRpcClient } from "./rpc";

/** 'TXN\0' — prefix used to compute the hash of a signed transaction. */
const TXN_HASH_PREFIX = new Uint8Array([0x54, 0x58, 0x4e, 0x00]);
const BASE_FEE_DROPS = "12";
const LEDGER_BUFFER = 20;
const POLL_INTERVAL_MS = 2_000;
const DEFAULT_RECENT_BLOCKS = 10;
/** Default and maximum page size for {@link XrplAdapter.getAccountTransactions}. */
const DEFAULT_TX_LIMIT = 20;
const MAX_TX_LIMIT = 100;
/** Seconds between the unix epoch (1970) and the XRPL/Ripple epoch (2000). */
const RIPPLE_EPOCH_OFFSET = 946_684_800;
/**
 * Issued currencies on XRPL carry no on-ledger `decimals` — balances are
 * arbitrary-precision decimal strings (up to 15 significant digits). We pin a
 * fixed scale so token amounts share the common `bigint` base-unit shape the
 * adapter interface uses, round-tripping through {@link parseUnits}/{@link formatUnits}.
 */
const XRPL_TOKEN_DECIMALS = 15;
/**
 * Default trustline limit when registering a token: the maximum amount the
 * account is willing to hold. A large default avoids capping incoming
 * transfers; callers can override it (e.g. "0" to remove the line).
 */
const DEFAULT_TRUST_LIMIT = "1000000000000000";

const sha512half = (data: Uint8Array): Uint8Array => sha512(data).slice(0, 32);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * XRPL public key encoding: secp256k1 keys are the 33-byte compressed key as
 * hex; ed25519 keys (32 raw bytes) get the 0xED prefix that pads them to the
 * same 33-byte format.
 */
function toXrplPublicKeyHex(publicKey: Uint8Array): string {
  const hex = bytesToHex(publicKey).toUpperCase();
  return publicKey.length === 32 ? `ED${hex}` : hex;
}

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
  const ascii = new TextDecoder().decode(bytes).replace(/\0+$/, "").trim();
  return ascii || undefined;
}

interface AccountInfoResult {
  error?: string;
  error_message?: string;
  account_data?: { Balance: string; Sequence: number; OwnerCount?: number };
}

interface ServerInfoResult {
  info?: {
    validated_ledger?: {
      reserve_base_xrp: number;
      reserve_inc_xrp: number;
    };
  };
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

/** The opaque {@link AccountTxQuery.cursor} decodes to an XRPL ledger marker. */
interface AccountTxMarker {
  ledger: number;
  seq: number;
}

/** A single Payment/TrustSet body as returned inside an `account_tx` entry. */
interface AccountTxBody {
  hash?: string;
  TransactionType?: string;
  Account?: string;
  Destination?: string;
  Amount?: string | IouAmount;
  Fee?: string;
  date?: number;
}

interface AccountTxEntry {
  /** Older rippled nests the tx under `tx`; newer builds use `tx_json`. */
  tx?: AccountTxBody;
  tx_json?: AccountTxBody;
  /** `tx_json` builds surface the hash and date as siblings of `tx_json`. */
  hash?: string;
  date?: number;
  meta?: {
    TransactionResult?: string;
    delivered_amount?: string | IouAmount;
  };
  validated?: boolean;
}

interface AccountTxResult {
  error?: string;
  error_message?: string;
  transactions?: AccountTxEntry[];
  marker?: AccountTxMarker;
}

export class XrplAdapter implements ChainAdapter {
  private readonly rpc: XrplRpcClient;

  constructor(readonly config: NetworkConfig) {
    this.rpc = new XrplRpcClient(config.rpcUrl, config.chainId);
  }

  deriveAddress(publicKey: Uint8Array): string {
    return deriveAddress(toXrplPublicKeyHex(publicKey));
  }

  isValidAddress(address: string): boolean {
    return isValidClassicAddress(address);
  }

  async getBalance(address: string): Promise<Balance> {
    const { symbol, decimals } = this.config.nativeCurrency;
    const result = await this.rpc.request<AccountInfoResult>("account_info", {
      account: address,
      ledger_index: "validated",
    });
    if (result.error === "actNotFound") {
      // Unfunded accounts do not exist on ledger yet.
      return { symbol, decimals, amount: 0n, formatted: "0" };
    }
    if (result.error || !result.account_data) {
      throw xrplRpcError(
        result.error ?? "account_info failed",
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
    const latest = await this.rpc.request<LedgerResult>("ledger", {
      ledger_index: "validated",
      transactions: true,
    });
    const newest = latest.ledger_index;
    const older = await Promise.all(
      Array.from({ length: count - 1 }, (_, i) => newest - i - 1)
        .filter((index) => index > 0)
        .map((index) =>
          this.rpc.request<LedgerResult>("ledger", {
            ledger_index: index,
            transactions: true,
          }),
        ),
    );
    return [latest, ...older].map((result) => this.toBlock(result));
  }

  /**
   * Account history via the XRPL `account_tx` method. Returns newest-first
   * (`forward: false`) and paginates through the ledger `marker`, which we
   * serialize into the opaque {@link AccountTxQuery.cursor}.
   */
  async getAccountTransactions(
    address: string,
    query?: AccountTxQuery,
  ): Promise<AccountTxPage> {
    const limit = Math.min(
      MAX_TX_LIMIT,
      Math.max(1, Math.floor(query?.limit ?? DEFAULT_TX_LIMIT)),
    );
    const params: Record<string, unknown> = {
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      binary: false,
      forward: false,
      limit,
    };
    if (query?.cursor) {
      params.marker = JSON.parse(query.cursor) as AccountTxMarker;
    }

    const result = await this.rpc.request<AccountTxResult>(
      "account_tx",
      params,
    );
    if (result.error === "actNotFound") {
      // Unfunded accounts have no history yet.
      return { transactions: [] };
    }
    if (result.error) {
      throw xrplRpcError(
        result.error,
        result.error_message,
        this.config.chainId,
      );
    }

    const transactions = (result.transactions ?? [])
      .map((entry) => this.toLedgerTransaction(entry, address))
      .filter((tx): tx is LedgerTransaction => tx !== undefined);
    return {
      transactions,
      nextCursor: result.marker ? JSON.stringify(result.marker) : undefined,
    };
  }

  async transfer(params: TransferParams, signer: Signer): Promise<TxResult> {
    // Native XRP: `Amount` is a string count of drops.
    return this.sendPayment(
      params.from,
      params.to,
      params.amount.toString(),
      signer,
    );
  }

  async listTokens(address: string): Promise<TokenBalance[]> {
    const result = await this.rpc.request<AccountLinesResult>("account_lines", {
      account: address,
      ledger_index: "validated",
    });
    if (result.error === "actNotFound") {
      // Unfunded accounts hold no trustlines yet.
      return [];
    }
    if (result.error || !result.lines) {
      throw xrplRpcError(
        result.error ?? "account_lines failed",
        result.error_message,
        this.config.chainId,
      );
    }
    return (
      result.lines
        // A holder's balance is positive; negative lines are the issuer side.
        .filter((line) => !line.balance.startsWith("-") && line.balance !== "0")
        .map((line) =>
          this.toTokenBalance(line.currency, line.account, line.balance),
        )
    );
  }

  async getTokenBalance(
    address: string,
    token: TokenInfo,
  ): Promise<TokenBalance> {
    const result = await this.rpc.request<AccountLinesResult>("account_lines", {
      account: address,
      peer: token.issuer,
      ledger_index: "validated",
    });
    const zero = this.toTokenBalance(token.symbol, token.issuer, "0");
    if (result.error === "actNotFound") {
      return zero;
    }
    if (result.error || !result.lines) {
      throw xrplRpcError(
        result.error ?? "account_lines failed",
        result.error_message,
        this.config.chainId,
      );
    }
    const line = result.lines.find((l) => l.currency === token.symbol);
    if (!line || line.balance.startsWith("-")) {
      return zero;
    }
    return this.toTokenBalance(line.currency, line.account, line.balance);
  }

  async transferToken(
    params: TokenTransferParams,
    signer: Signer,
  ): Promise<TxResult> {
    const amount: IouAmount = {
      currency: params.token.symbol,
      issuer: params.token.issuer,
      value: formatUnits(params.amount, params.token.decimals),
    };
    return this.sendPayment(params.from, params.to, amount, signer);
  }

  /**
   * Registers a token by opening (or updating) a trustline to its issuer via a
   * TrustSet. An XRPL account must hold a trustline before it can receive an
   * issued currency. `limit` is the maximum the account is willing to hold;
   * passing "0" removes the line once its balance is zero.
   */
  async registerToken(
    params: RegisterTokenParams,
    signer: Signer,
  ): Promise<TxResult> {
    const limit: IouAmount = {
      currency: params.token.symbol,
      issuer: params.token.issuer,
      value: params.limit ?? DEFAULT_TRUST_LIMIT,
    };
    return this.submitTransaction(
      { TransactionType: "TrustSet", LimitAmount: limit },
      params.from,
      signer,
    );
  }

  /**
   * Shared Payment pipeline for native XRP and issued currencies. `amount` is a
   * drops string for XRP or an {@link IouAmount} object for tokens.
   */
  private async sendPayment(
    from: string,
    to: string,
    amount: string | IouAmount,
    signer: Signer,
  ): Promise<TxResult> {
    return this.submitTransaction(
      { TransactionType: "Payment", Destination: to, Amount: amount },
      from,
      signer,
    );
  }

  /**
   * Shared submit pipeline for any single-account transaction: load the account
   * sequence and current ledger, fill the common fields, sign through the
   * external signer, submit, and await validation. `fields` carries the
   * type-specific body (Payment `Amount`, TrustSet `LimitAmount`, ...).
   */
  private async submitTransaction(
    fields: Record<string, unknown>,
    from: string,
    signer: Signer,
  ): Promise<TxResult> {
    const accountInfo = await this.rpc.request<AccountInfoResult>(
      "account_info",
      {
        account: from,
        ledger_index: "current",
      },
    );
    if (accountInfo.error || !accountInfo.account_data) {
      throw xrplRpcError(
        accountInfo.error ?? "account_info failed",
        accountInfo.error_message,
        this.config.chainId,
      );
    }
    const ledger =
      await this.rpc.request<LedgerCurrentResult>("ledger_current");
    const lastLedgerSequence = ledger.ledger_current_index + LEDGER_BUFFER;

    const tx = {
      ...fields,
      Account: from,
      Fee: BASE_FEE_DROPS,
      Sequence: accountInfo.account_data.Sequence,
      LastLedgerSequence: lastLedgerSequence,
    };
    return this.signAndSubmit(tx, signer);
  }

  /**
   * Signs an already-built transaction (Account, Fee, Sequence and
   * LastLedgerSequence already set), submits it, and awaits validation. This is
   * the signing half of the prepare → sign → submit flow used by the agent and
   * the on-device wallet, so the exact transaction the user approved is the one
   * that gets signed.
   */
  async signAndSubmit(
    tx: Record<string, unknown>,
    signer: Signer,
  ): Promise<TxResult> {
    let blob: string;
    try {
      blob = await this.signTransaction({ ...tx }, signer);
    } catch (cause) {
      throw new ChainError(ChainErrors.SIGNING_FAILED, {
        chainId: this.config.chainId,
        cause,
      });
    }
    const hash = bytesToHex(
      sha512half(concatBytes(TXN_HASH_PREFIX, hexToBytes(blob))),
    ).toUpperCase();

    const submit = await this.rpc.request<SubmitResult>("submit", {
      tx_blob: blob,
    });
    if (submit.error) {
      throw xrplRpcError(
        submit.error,
        submit.error_message,
        this.config.chainId,
      );
    }
    const engineResult = submit.engine_result ?? "";
    // tes = applied to open ledger; ter = retriable, may still make it in.
    if (engineResult !== "tesSUCCESS" && !engineResult.startsWith("ter")) {
      return {
        hash,
        success: false,
        error: `${engineResult}: ${submit.engine_result_message ?? ""}`.trim(),
        code: xrplResultToError(engineResult).code,
        explorerUrl: this.explorerUrl(hash),
      };
    }
    const lastLedgerSequence = Number(tx.LastLedgerSequence ?? 0);
    return this.waitForValidation(hash, lastLedgerSequence);
  }

  /**
   * Assembles the read-only chain state needed to build and validate a
   * transaction (sequence, current ledger, balance, reserve, fee). The
   * transaction layer turns this into a canonical tx; nothing here signs.
   */
  async buildContext(account: string): Promise<TxContext> {
    const info = await this.rpc.request<AccountInfoResult>("account_info", {
      account,
      ledger_index: "current",
    });
    if (info.error || !info.account_data) {
      throw xrplRpcError(
        info.error ?? "account_info failed",
        info.error_message,
        this.config.chainId,
      );
    }
    const ledger =
      await this.rpc.request<LedgerCurrentResult>("ledger_current");
    return {
      account,
      sequence: info.account_data.Sequence,
      ledgerIndex: ledger.ledger_current_index,
      balanceDrops: BigInt(info.account_data.Balance),
      reserveDrops: await this.reserveDrops(info.account_data.OwnerCount ?? 0),
      feeDrops: BigInt(BASE_FEE_DROPS),
    };
  }

  /** Current reserve requirement in drops: base + per-owned-object increment. */
  private async reserveDrops(ownerCount: number): Promise<bigint> {
    const server = await this.rpc.request<ServerInfoResult>("server_info");
    const ledger = server.info?.validated_ledger;
    const toDrops = (xrp: number) => BigInt(Math.round(xrp * 1_000_000));
    // Fall back to current testnet defaults if server_info omits the figures.
    const base = ledger ? toDrops(ledger.reserve_base_xrp) : 1_000_000n;
    const inc = ledger ? toDrops(ledger.reserve_inc_xrp) : 200_000n;
    return base + inc * BigInt(ownerCount);
  }

  async requestFaucet(address: string): Promise<void> {
    const { faucetUrl, chainId } = this.config;
    if (!faucetUrl) {
      throw new ChainError(ChainErrors.RPC, {
        chainId,
        detail: `No faucet configured for ${this.config.name}`,
      });
    }
    let response: Response;
    try {
      response = await fetch(faucetUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destination: address }),
      });
    } catch (cause) {
      throw new ChainError(ChainErrors.NETWORK, {
        chainId,
        detail: "Faucet request failed",
        cause,
      });
    }
    if (!response.ok) {
      throw new ChainError(ChainErrors.RPC, {
        chainId,
        detail: `Faucet HTTP ${response.status}`,
      });
    }
  }

  private toTokenBalance(
    currency: string,
    issuer: string,
    balance: string,
  ): TokenBalance {
    const value = balance.startsWith("-") ? balance.slice(1) : balance;
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
   * External-signer pipeline: serialize for signing, sign through the keyring
   * Signer, then attach the signature.
   *
   * The two XRPL signing schemes split the work differently (matching
   * ripple-keypairs): secp256k1 signs the sha512-half digest of the signing
   * payload and encodes the signature as DER, while ed25519 signs the full
   * prefix-included payload bytes directly (no pre-hash) and uses the raw
   * 64-byte signature.
   */
  private async signTransaction(
    tx: Record<string, unknown>,
    signer: Signer,
  ): Promise<string> {
    tx.SigningPubKey = toXrplPublicKeyHex(signer.publicKey);
    const payload = hexToBytes(encodeForSigning(tx));
    if (signer.curve === "ed25519") {
      if (!signer.signMessage) {
        throw new ChainError(ChainErrors.SIGNING_FAILED, {
          chainId: this.config.chainId,
          detail: "ed25519 signer does not implement signMessage",
        });
      }
      const { signature } = await signer.signMessage(payload);
      tx.TxnSignature = bytesToHex(signature).toUpperCase();
    } else {
      const { signature } = await signer.signDigest(sha512half(payload));
      tx.TxnSignature = secp256k1.Signature.fromCompact(signature)
        .toDERHex()
        .toUpperCase();
    }
    return encode(tx);
  }

  private async waitForValidation(
    hash: string,
    lastLedgerSequence: number,
  ): Promise<TxResult> {
    const explorerUrl = this.explorerUrl(hash);
    for (;;) {
      await sleep(POLL_INTERVAL_MS);
      const tx = await this.rpc.request<TxLookupResult>("tx", {
        transaction: hash,
      });
      if (tx.validated) {
        const code = tx.meta?.TransactionResult;
        if (code === "tesSUCCESS") {
          return { hash, success: true, explorerUrl };
        }
        return {
          hash,
          success: false,
          error: code,
          code: (code
            ? xrplResultToError(code)
            : ChainErrors.TRANSACTION_FAILED
          ).code,
          explorerUrl,
        };
      }
      if (tx.error && tx.error !== "txnNotFound") {
        throw xrplRpcError(tx.error, tx.error_message, this.config.chainId);
      }
      const ledger =
        await this.rpc.request<LedgerCurrentResult>("ledger_current");
      if (ledger.ledger_current_index > lastLedgerSequence) {
        return {
          hash,
          success: false,
          error: "Transaction expired without being validated",
          code: ChainErrors.TRANSACTION_EXPIRED.code,
          explorerUrl,
        };
      }
    }
  }

  /**
   * Maps a single `account_tx` entry to the normalized {@link LedgerTransaction}.
   * Returns undefined for entries with no usable transaction body so the caller
   * can filter them out.
   */
  private toLedgerTransaction(
    entry: AccountTxEntry,
    address: string,
  ): LedgerTransaction | undefined {
    // Older rippled returns `tx`; newer builds nest the body under `tx_json`
    // and surface hash/date as siblings.
    const tx = entry.tx ?? entry.tx_json;
    const hash = tx?.hash ?? entry.hash;
    if (!tx || !hash) {
      return undefined;
    }
    const date = tx.date ?? entry.date ?? 0;
    const result = entry.meta?.TransactionResult;
    const nativeSymbol = this.config.nativeCurrency.symbol;

    let kind: LedgerTxKind;
    if (tx.TransactionType === "Payment") {
      // A string `Amount` is drops (native); an object is an issued currency.
      kind = typeof tx.Amount === "string" ? "payment" : "token-payment";
    } else if (tx.TransactionType === "TrustSet") {
      kind = "trustset";
    } else {
      kind = "other";
    }

    let direction: TxDirection;
    if (tx.Account === address && tx.Destination === address) {
      direction = "self";
    } else if (tx.Account === address) {
      direction = "out";
    } else {
      direction = "in";
    }

    let amount = 0n;
    let symbol = nativeSymbol;
    if (kind === "payment") {
      // Prefer the actually delivered amount (partial payments deliver less).
      const delivered = entry.meta?.delivered_amount;
      const drops =
        typeof delivered === "string" ? delivered : (tx.Amount as string);
      amount = BigInt(drops);
    } else if (kind === "token-payment") {
      const iou = (
        typeof entry.meta?.delivered_amount === "object"
          ? entry.meta.delivered_amount
          : tx.Amount
      ) as IouAmount;
      symbol = iou.currency;
      amount = parseUnits(iou.value, XRPL_TOKEN_DECIMALS);
    }

    let counterparty: string | undefined;
    if (direction === "out") {
      counterparty = tx.Destination;
    } else if (direction === "in") {
      counterparty = tx.Account;
    }

    return {
      hash,
      timestamp: date + RIPPLE_EPOCH_OFFSET,
      kind,
      direction,
      success: result === "tesSUCCESS",
      amount,
      symbol,
      counterparty,
      fee: tx.Fee !== undefined ? BigInt(tx.Fee) : undefined,
      explorerUrl: this.explorerUrl(hash),
    };
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
    return this.config.explorerUrl
      ? `${this.config.explorerUrl}/transactions/${hash}`
      : undefined;
  }
}
