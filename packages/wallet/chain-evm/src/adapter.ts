import {
  type Balance,
  type Block,
  type ChainAdapter,
  ChainError,
  ChainErrors,
  formatUnits,
  type NetworkConfig,
  type Signer,
  type TokenBalance,
  type TokenInfo,
  type TokenTransferParams,
  type TransferParams,
  type TxResult,
} from '@flama/chain-core';
import { secp256k1 } from '@noble/curves/secp256k1';
import {
  type Address,
  type Chain,
  createPublicClient,
  createWalletClient,
  defineChain,
  erc20Abi,
  http,
  isAddress,
  keccak256,
  type LocalAccount,
  type PublicClient,
  serializeTransaction,
  toHex,
} from 'viem';
import { publicKeyToAddress, toAccount } from 'viem/accounts';
import { mapEvmError } from './errors';

const DEFAULT_RECENT_BLOCKS = 10;

export class EvmAdapter implements ChainAdapter {
  private readonly chain: Chain;
  private readonly publicClient: PublicClient;

  constructor(readonly config: NetworkConfig) {
    this.chain = defineChain({
      id: Number(config.chainId.split(':')[1]),
      name: config.name,
      nativeCurrency: {
        name: config.nativeCurrency.symbol,
        symbol: config.nativeCurrency.symbol,
        decimals: config.nativeCurrency.decimals,
      },
      rpcUrls: { default: { http: [config.rpcUrl] } },
    });
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    });
  }

  deriveAddress(publicKey: Uint8Array): string {
    const uncompressed = secp256k1.ProjectivePoint.fromHex(publicKey).toRawBytes(false);
    return publicKeyToAddress(toHex(uncompressed));
  }

  isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  async getBalance(address: string): Promise<Balance> {
    const { symbol, decimals } = this.config.nativeCurrency;
    try {
      const amount = await this.publicClient.getBalance({
        address: address as Address,
      });
      return {
        symbol,
        decimals,
        amount,
        formatted: formatUnits(amount, decimals),
      };
    } catch (error) {
      throw mapEvmError(error, this.config.chainId);
    }
  }

  async getRecentBlocks(limit = DEFAULT_RECENT_BLOCKS): Promise<Block[]> {
    const count = BigInt(Math.max(1, Math.floor(limit)));
    try {
      const latest = await this.publicClient.getBlockNumber();
      const heights: bigint[] = [];
      for (let i = 0n; i < count && latest - i >= 0n; i++) {
        heights.push(latest - i);
      }
      const blocks = await Promise.all(
        heights.map((blockNumber) => this.publicClient.getBlock({ blockNumber })),
      );
      return blocks.map((block) => ({
        height: Number(block.number),
        hash: block.hash ?? '',
        timestamp: Number(block.timestamp),
        transactionCount: block.transactions.length,
      }));
    } catch (error) {
      throw mapEvmError(error, this.config.chainId);
    }
  }

  async transfer(params: TransferParams, signer: Signer): Promise<TxResult> {
    const walletClient = createWalletClient({
      account: this.toAccount(signer),
      chain: this.chain,
      transport: http(),
    });
    let hash: `0x${string}`;
    try {
      hash = await walletClient.sendTransaction({
        to: params.to as Address,
        value: params.amount,
      });
    } catch (error) {
      throw mapEvmError(error, this.config.chainId);
    }
    return this.waitForReceipt(hash);
  }

  async listTokens(address: string): Promise<TokenBalance[]> {
    // EVM has no on-chain enumeration of held ERC-20s; query the curated list.
    const tokens = this.config.tokens ?? [];
    return Promise.all(tokens.map((token) => this.getTokenBalance(address, token)));
  }

  async getTokenBalance(address: string, token: TokenInfo): Promise<TokenBalance> {
    const contract = token.issuer as Address;
    try {
      const [amount, decimals, symbol] = await Promise.all([
        this.publicClient.readContract({
          address: contract,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as Address],
        }),
        token.decimals
          ? Promise.resolve(token.decimals)
          : this.publicClient.readContract({
              address: contract,
              abi: erc20Abi,
              functionName: 'decimals',
            }),
        token.symbol
          ? Promise.resolve(token.symbol)
          : this.publicClient.readContract({
              address: contract,
              abi: erc20Abi,
              functionName: 'symbol',
            }),
      ]);
      return {
        symbol,
        issuer: token.issuer,
        decimals,
        name: token.name,
        amount,
        formatted: formatUnits(amount, decimals),
      };
    } catch (error) {
      throw mapEvmError(error, this.config.chainId);
    }
  }

  async transferToken(params: TokenTransferParams, signer: Signer): Promise<TxResult> {
    const walletClient = createWalletClient({
      account: this.toAccount(signer),
      chain: this.chain,
      transport: http(),
    });
    let hash: `0x${string}`;
    try {
      hash = await walletClient.writeContract({
        address: params.token.issuer as Address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [params.to as Address, params.amount],
      });
    } catch (error) {
      throw mapEvmError(error, this.config.chainId);
    }
    return this.waitForReceipt(hash);
  }

  /** Awaits a mined transaction and normalizes the receipt into a {@link TxResult}. */
  private async waitForReceipt(hash: `0x${string}`): Promise<TxResult> {
    const explorerUrl = this.config.explorerUrl
      ? `${this.config.explorerUrl}/tx/${hash}`
      : undefined;
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const success = receipt.status === 'success';
    return {
      hash,
      success,
      error: success ? undefined : 'Transaction reverted',
      code: success ? undefined : ChainErrors.TRANSACTION_FAILED.code,
      explorerUrl,
    };
  }

  /**
   * Wraps the keyring Signer as a viem account: viem serializes and hashes,
   * the keyring signs the digest, viem re-serializes with the signature.
   *
   * EVM signatures must be recoverable, so only secp256k1 signers that return
   * a recovery id are accepted.
   */
  toAccount(signer: Signer): LocalAccount {
    if (signer.curve !== 'secp256k1') {
      throw new ChainError(ChainErrors.SIGNING_FAILED, {
        chainId: this.config.chainId,
        detail: `EVM requires a secp256k1 signer, got ${signer.curve}`,
      });
    }
    const address = this.deriveAddress(signer.publicKey) as Address;
    return toAccount({
      address,
      signTransaction: async (transaction, options) => {
        const serializer = options?.serializer ?? serializeTransaction;
        const digest = keccak256(await serializer(transaction), 'bytes');
        const { signature, recovery } = await signer.signDigest(digest);
        if (recovery === undefined) {
          throw new ChainError(ChainErrors.SIGNING_FAILED, {
            chainId: this.config.chainId,
            detail: 'Signer did not return a recovery id',
          });
        }
        return serializer(transaction, {
          r: toHex(signature.slice(0, 32)),
          s: toHex(signature.slice(32, 64)),
          v: BigInt(27 + recovery),
          yParity: recovery,
        });
      },
      signMessage: async () => {
        throw new Error('signMessage is not supported yet');
      },
      signTypedData: async () => {
        throw new Error('signTypedData is not supported yet');
      },
    });
  }
}
