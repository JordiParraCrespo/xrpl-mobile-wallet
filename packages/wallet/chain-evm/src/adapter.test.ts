import { derivationPath, KeyringManager, type SecureStorage } from '@flama/wallet-keyring';
import { parseEther, recoverTransactionAddress } from 'viem';
import { describe, expect, it } from 'vitest';
import { EvmAdapter } from './adapter';
import { XRPL_EVM_TESTNET } from './config';

const MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

function memoryStorage(): SecureStorage {
  const data = new Map<string, string>();
  return {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
}

async function testSigner() {
  const keyring = new KeyringManager(memoryStorage());
  const wallet = await keyring.importMnemonic(MNEMONIC);
  return keyring.getSigner(wallet.id, derivationPath('evm', 0));
}

describe('EvmAdapter', () => {
  it("derives the standard test vector address for m/44'/60'/0'/0/0", async () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const signer = await testSigner();
    // Known BIP-44 vector for the "abandon ... about" mnemonic.
    expect(adapter.deriveAddress(signer.publicKey)).toBe(
      '0x9858EfFD232B4033E47d90003D41EC34EcaEda94',
    );
  });

  it('signs an EIP-1559 transaction recoverable to the derived address', async () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    const signer = await testSigner();
    const account = adapter.toAccount(signer);

    const serialized = await account.signTransaction({
      chainId: 1449000,
      type: 'eip1559',
      to: '0x0000000000000000000000000000000000000001',
      value: parseEther('0.1'),
      nonce: 0,
      gas: 21000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
    });

    const recovered = await recoverTransactionAddress({
      serializedTransaction: serialized as `0x02${string}`,
    });
    expect(recovered).toBe(adapter.deriveAddress(signer.publicKey));
  });

  it('validates addresses', () => {
    const adapter = new EvmAdapter(XRPL_EVM_TESTNET);
    expect(adapter.isValidAddress('0x9858EfFD232B4033E47d90003D41EC34EcaEda94')).toBe(true);
    expect(adapter.isValidAddress('rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe')).toBe(false);
  });
});
