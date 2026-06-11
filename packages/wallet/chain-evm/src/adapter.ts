import {
  type Balance,
  type ChainAdapter,
  formatUnits,
  type NetworkConfig,
  type Signer,
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
  http,
  isAddress,
  keccak256,
  type LocalAccount,
  type PublicClient,
  serializeTransaction,
  toHex,
} from 'viem';
import { publicKeyToAddress, toAccount } from 'viem/accounts';

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
    const amount = await this.publicClient.getBalance({
      address: address as Address,
    });
    return {
      symbol,
      decimals,
      amount,
      formatted: formatUnits(amount, decimals),
    };
  }

  async transfer(params: TransferParams, signer: Signer): Promise<TxResult> {
    const walletClient = createWalletClient({
      account: this.toAccount(signer),
      chain: this.chain,
      transport: http(),
    });
    const hash = await walletClient.sendTransaction({
      to: params.to as Address,
      value: params.amount,
    });
    const explorerUrl = this.config.explorerUrl
      ? `${this.config.explorerUrl}/tx/${hash}`
      : undefined;
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    return {
      hash,
      success: receipt.status === 'success',
      error: receipt.status === 'success' ? undefined : 'Transaction reverted',
      explorerUrl,
    };
  }

  /**
   * Wraps the keyring Signer as a viem account: viem serializes and hashes,
   * the keyring signs the digest, viem re-serializes with the signature.
   */
  toAccount(signer: Signer): LocalAccount {
    const address = this.deriveAddress(signer.publicKey) as Address;
    return toAccount({
      address,
      signTransaction: async (transaction, options) => {
        const serializer = options?.serializer ?? serializeTransaction;
        const digest = keccak256(await serializer(transaction), 'bytes');
        const { signature, recovery } = await signer.signDigest(digest);
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
