import 'reflect-metadata';
import {
  type ChainAdapter,
  type ChainKind,
  ChainRegistry,
  type RegisterTokenParams,
  type Signer,
  type TokenBalance,
  type TokenInfo,
  type TokenTransferParams,
  type TxResult,
} from '@flama/chain-core';
import type { KeyringManager } from '@flama/wallet-keyring';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { AppError } from '../core/errors';
import { TokensErrors } from './tokens.errors';
import { TokensService } from './tokens.service';

// ---------------------------------------------------------------------------
// FakeKeyring: only the two methods TokensService calls — getActiveWallet()
// and getSigner(walletId, kind, index). KeyringManager is type-only imported
// (its dist may be stale), so we cast `as unknown as KeyringManager`.
// ---------------------------------------------------------------------------

interface FakeWalletMeta {
  id: string;
  chains: ChainKind[];
}

class FakeKeyring {
  activeWallet: FakeWalletMeta | null = {
    id: 'wallet-1',
    chains: ['xrpl', 'evm'],
  };
  getSigner = vi.fn(
    (walletId: string, kind: ChainKind, _index: number): Signer => ({
      curve: kind === 'xrpl' ? 'ed25519' : 'secp256k1',
      publicKey: new TextEncoder().encode(`${walletId}/${kind}`),
      signDigest: async () => ({ signature: new Uint8Array(64), recovery: 0 }),
      signMessage: async () => ({ signature: new Uint8Array(64) }),
    }),
  );

  getActiveWallet(): FakeWalletMeta | null {
    return this.activeWallet;
  }
}

// ---------------------------------------------------------------------------
// Fake chain adapters in a real ChainRegistry. Only the surface TokensService
// touches matters: config.{chainId,kind}, deriveAddress, isValidAddress and
// the token methods. Native methods are present to satisfy ChainAdapter.
// ---------------------------------------------------------------------------

interface FakeAdapter extends ChainAdapter {
  listTokens: Mock<ChainAdapter['listTokens']>;
  getTokenBalance: Mock<ChainAdapter['getTokenBalance']>;
  transferToken: Mock<ChainAdapter['transferToken']>;
  registerToken?: Mock<NonNullable<ChainAdapter['registerToken']>>;
}

function fakeAdapter(input: {
  chainId: string;
  kind: ChainKind;
  symbol: string;
  decimals: number;
  withRegister?: boolean;
}): FakeAdapter {
  const tokens: TokenBalance[] = [
    {
      symbol: 'USD',
      issuer: `${input.kind}-issuer`,
      decimals: 2,
      amount: 12_345n,
      formatted: '123.45',
    },
  ];

  const adapter: FakeAdapter = {
    config: {
      chainId: input.chainId,
      kind: input.kind,
      name: input.chainId,
      rpcUrl: 'http://localhost:1234',
      nativeCurrency: { symbol: input.symbol, decimals: input.decimals },
    },
    deriveAddress: (publicKey: Uint8Array) =>
      `${input.kind}-addr-${new TextDecoder().decode(publicKey)}`,
    isValidAddress: (address: string) => address.startsWith(`${input.kind}-`),
    getBalance: async () => {
      throw new Error('not used by TokensService tests');
    },
    getRecentBlocks: async () => [],
    transfer: async (): Promise<TxResult> => ({
      hash: '0xnative',
      success: true,
    }),
    listTokens: vi.fn(async (): Promise<TokenBalance[]> => tokens),
    getTokenBalance: vi.fn(
      async (_address: string, token: TokenInfo): Promise<TokenBalance> => ({
        ...token,
        amount: 999n,
        formatted: '9.99',
      }),
    ),
    transferToken: vi.fn(async (): Promise<TxResult> => ({ hash: '0xtoken', success: true })),
  };

  if (input.withRegister !== false) {
    adapter.registerToken = vi.fn(
      async (): Promise<TxResult> => ({ hash: '0xtrustset', success: true }),
    );
  }

  return adapter;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const XRPL_CHAIN = 'xrpl:testnet';
const EVM_CHAIN = 'evm:1449000';

const XRPL_TOKEN: TokenInfo = {
  symbol: 'USD',
  issuer: 'rIssuer',
  decimals: 2,
};
const EVM_TOKEN: TokenInfo = {
  symbol: 'USDC',
  issuer: '0xcontract',
  decimals: 6,
};

let keyring: FakeKeyring;
let xrpl: FakeAdapter;
let evm: FakeAdapter;
let registry: ChainRegistry;
let service: TokensService;

beforeEach(() => {
  keyring = new FakeKeyring();
  xrpl = fakeAdapter({
    chainId: XRPL_CHAIN,
    kind: 'xrpl',
    symbol: 'XRP',
    decimals: 6,
  });
  evm = fakeAdapter({
    chainId: EVM_CHAIN,
    kind: 'evm',
    symbol: 'XRP',
    decimals: 18,
    // EVM ERC-20s need no on-chain registration: drop registerToken.
    withRegister: false,
  });
  registry = new ChainRegistry([xrpl, evm]);
  service = new TokensService(keyring as unknown as KeyringManager, registry);
});

async function expectAppError(run: () => unknown, definition: { code: string }): Promise<void> {
  const error = await Promise.resolve()
    .then(run)
    .then(() => null)
    .catch((e: unknown) => e);
  expect(error).toBeInstanceOf(AppError);
  expect((error as AppError).code).toBe(definition.code);
}

// Derived address for the active wallet on each chain.
const XRPL_FROM = 'xrpl-addr-wallet-1/xrpl';
const EVM_FROM = 'evm-addr-wallet-1/evm';

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------

describe('TokensService.list', () => {
  it("returns the adapter's tokens for the active wallet address", async () => {
    const result = await service.list(XRPL_CHAIN);

    expect(xrpl.listTokens).toHaveBeenCalledTimes(1);
    expect(xrpl.listTokens).toHaveBeenCalledWith(XRPL_FROM);
    expect(result).toEqual([
      {
        symbol: 'USD',
        issuer: 'xrpl-issuer',
        decimals: 2,
        amount: 12_345n,
        formatted: '123.45',
      },
    ]);
  });

  it('resolves the signer via getSigner(walletId, kind, 0)', async () => {
    await service.list(EVM_CHAIN);

    expect(keyring.getSigner).toHaveBeenCalledWith('wallet-1', 'evm', 0);
    expect(evm.listTokens).toHaveBeenCalledWith(EVM_FROM);
  });

  it('throws UNKNOWN_CHAIN for a chain not in the registry', async () => {
    await expectAppError(() => service.list('solana:devnet'), TokensErrors.UNKNOWN_CHAIN);
  });

  it('throws NOT_INITIALIZED when there is no active wallet', async () => {
    keyring.activeWallet = null;
    await expectAppError(() => service.list(XRPL_CHAIN), TokensErrors.NOT_INITIALIZED);
    expect(xrpl.listTokens).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getBalance
// ---------------------------------------------------------------------------

describe('TokensService.getBalance', () => {
  it('passes the token through to the adapter for the active address', async () => {
    const balance = await service.getBalance(XRPL_CHAIN, XRPL_TOKEN);

    expect(xrpl.getTokenBalance).toHaveBeenCalledTimes(1);
    expect(xrpl.getTokenBalance).toHaveBeenCalledWith(XRPL_FROM, XRPL_TOKEN);
    expect(balance).toEqual({ ...XRPL_TOKEN, amount: 999n, formatted: '9.99' });
  });

  it('throws UNKNOWN_CHAIN for an unregistered chain', async () => {
    await expectAppError(
      () => service.getBalance('solana:devnet', XRPL_TOKEN),
      TokensErrors.UNKNOWN_CHAIN,
    );
  });

  it('throws NOT_INITIALIZED when there is no active wallet', async () => {
    keyring.activeWallet = null;
    await expectAppError(
      () => service.getBalance(XRPL_CHAIN, XRPL_TOKEN),
      TokensErrors.NOT_INITIALIZED,
    );
  });
});

// ---------------------------------------------------------------------------
// send
// ---------------------------------------------------------------------------

describe('TokensService.send', () => {
  it('transfers the parseUnits-scaled amount with correct from/to/token/signer', async () => {
    const result = await service.send(XRPL_CHAIN, 'xrpl-destination', XRPL_TOKEN, '1.5');

    expect(result).toEqual({ hash: '0xtoken', success: true });
    expect(xrpl.transferToken).toHaveBeenCalledTimes(1);
    const [params, signer] = xrpl.transferToken.mock.calls[0] as [TokenTransferParams, Signer];
    expect(params).toEqual({
      from: XRPL_FROM,
      to: 'xrpl-destination',
      token: XRPL_TOKEN,
      // 1.5 at 2 decimals -> 150 base units.
      amount: 150n,
    });
    expect(signer.curve).toBe('ed25519');
  });

  it('scales by the token decimals (EVM, 6 decimals)', async () => {
    await service.send(EVM_CHAIN, 'evm-destination', EVM_TOKEN, '2.5');

    const [params] = evm.transferToken.mock.calls[0] as [TokenTransferParams, Signer];
    expect(params.amount).toBe(2_500_000n);
    expect(params.from).toBe(EVM_FROM);
    expect(params.to).toBe('evm-destination');
  });

  it('throws INVALID_ADDRESS and does not transfer when `to` fails isValidAddress', async () => {
    await expectAppError(
      () => service.send(XRPL_CHAIN, 'evm-wrong-network', XRPL_TOKEN, '1'),
      TokensErrors.INVALID_ADDRESS,
    );
    expect(xrpl.transferToken).not.toHaveBeenCalled();
  });

  it('throws UNKNOWN_CHAIN for an unregistered chain', async () => {
    await expectAppError(
      () => service.send('solana:devnet', 'somewhere', XRPL_TOKEN, '1'),
      TokensErrors.UNKNOWN_CHAIN,
    );
  });

  it('throws NOT_INITIALIZED when there is no active wallet', async () => {
    keyring.activeWallet = null;
    await expectAppError(
      () => service.send(XRPL_CHAIN, 'xrpl-destination', XRPL_TOKEN, '1'),
      TokensErrors.NOT_INITIALIZED,
    );
    expect(xrpl.transferToken).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

describe('TokensService.register', () => {
  it('calls registerToken with from/token/limit and the signer', async () => {
    const result = await service.register(XRPL_CHAIN, XRPL_TOKEN, '1000');

    expect(result).toEqual({ hash: '0xtrustset', success: true });
    const registerToken = xrpl.registerToken as Mock<NonNullable<ChainAdapter['registerToken']>>;
    expect(registerToken).toHaveBeenCalledTimes(1);
    const [params, signer] = registerToken.mock.calls[0] as [RegisterTokenParams, Signer];
    expect(params).toEqual({
      from: XRPL_FROM,
      token: XRPL_TOKEN,
      limit: '1000',
    });
    expect(signer.curve).toBe('ed25519');
  });

  it('passes limit as undefined when omitted', async () => {
    await service.register(XRPL_CHAIN, XRPL_TOKEN);

    const registerToken = xrpl.registerToken as Mock<NonNullable<ChainAdapter['registerToken']>>;
    const [params] = registerToken.mock.calls[0] as [RegisterTokenParams, Signer];
    expect(params).toEqual({
      from: XRPL_FROM,
      token: XRPL_TOKEN,
      limit: undefined,
    });
  });

  it('throws REGISTRATION_NOT_SUPPORTED when the adapter has no registerToken', async () => {
    await expectAppError(
      () => service.register(EVM_CHAIN, EVM_TOKEN, '1000'),
      TokensErrors.REGISTRATION_NOT_SUPPORTED,
    );
  });

  it('throws UNKNOWN_CHAIN for an unregistered chain', async () => {
    await expectAppError(
      () => service.register('solana:devnet', XRPL_TOKEN),
      TokensErrors.UNKNOWN_CHAIN,
    );
  });

  it('throws NOT_INITIALIZED when there is no active wallet', async () => {
    keyring.activeWallet = null;
    await expectAppError(
      () => service.register(XRPL_CHAIN, XRPL_TOKEN, '1000'),
      TokensErrors.NOT_INITIALIZED,
    );
    expect(xrpl.registerToken).not.toHaveBeenCalled();
  });
});
