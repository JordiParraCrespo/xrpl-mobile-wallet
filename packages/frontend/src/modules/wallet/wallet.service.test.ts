import 'reflect-metadata';
import {
  type Balance,
  type ChainAdapter,
  type ChainKind,
  ChainRegistry,
  type Signer,
  type TxResult,
} from '@flama/chain-core';
import type { KeyringManager } from '@flama/wallet-keyring';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { AppError } from '../core/errors';
import { WalletErrors } from './wallet.errors';
import { WalletService } from './wallet.service';
import { createWalletStore, type WalletStore } from './wallet.state';

// ---------------------------------------------------------------------------
// Keyring error doubles. The service maps errors by NAME, so local classes
// with matching names behave exactly like the real keyring package's errors.
// ---------------------------------------------------------------------------

class InvalidMnemonicError extends Error {
  constructor() {
    super('Invalid mnemonic phrase');
    this.name = 'InvalidMnemonicError';
  }
}
class InvalidFamilySeedError extends Error {
  constructor() {
    super('Invalid family seed');
    this.name = 'InvalidFamilySeedError';
  }
}
class InvalidSecretNumbersError extends Error {
  constructor() {
    super('Invalid secret numbers');
    this.name = 'InvalidSecretNumbersError';
  }
}
class KeyringLockedError extends Error {
  constructor() {
    super('Keyring is locked');
    this.name = 'KeyringLockedError';
  }
}
class UnsupportedChainError extends Error {
  constructor() {
    super('Unsupported chain');
    this.name = 'UnsupportedChainError';
  }
}
class WalletNotFoundError extends Error {
  constructor() {
    super('Wallet not found');
    this.name = 'WalletNotFoundError';
  }
}

// ---------------------------------------------------------------------------
// FakeKeyring implementing the KeyringManager contract used by the service.
// ---------------------------------------------------------------------------

const VALID_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const VALID_SEED = 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2';
const VALID_ROWS = ['554872', '394230', '209376', '323698', '140250', '387423', '652803', '258676'];

type WalletType = 'hd' | 'xrpl-seed';

interface FakeWalletMeta {
  id: string;
  name: string;
  type: WalletType;
  chains: ChainKind[];
  backedUp: boolean;
  createdAt: number;
}

class FakeKeyring {
  initialized = false;
  isUnlocked = false;
  wallets: FakeWalletMeta[] = [];
  activeId: string | null = null;
  private counter = 0;

  async isInitialized(): Promise<boolean> {
    return this.initialized;
  }

  getWallets(): FakeWalletMeta[] {
    return this.wallets.map((wallet) => ({ ...wallet }));
  }

  getActiveWallet(): FakeWalletMeta | null {
    const wallet = this.wallets.find((w) => w.id === this.activeId);
    return wallet ? { ...wallet } : null;
  }

  async setActiveWallet(id: string): Promise<void> {
    this.require(id);
    this.activeId = id;
  }

  async createWallet(options?: { name?: string; words?: 12 | 24 }): Promise<FakeWalletMeta> {
    return this.add('hd', ['xrpl', 'evm'], options?.name);
  }

  async importMnemonic(mnemonic: string, name?: string): Promise<FakeWalletMeta> {
    if (mnemonic !== VALID_MNEMONIC) {
      throw new InvalidMnemonicError();
    }
    return this.add('hd', ['xrpl', 'evm'], name);
  }

  async importFamilySeed(seed: string, name?: string): Promise<FakeWalletMeta> {
    if (seed !== VALID_SEED) {
      throw new InvalidFamilySeedError();
    }
    return this.add('xrpl-seed', ['xrpl'], name);
  }

  async importSecretNumbers(rows: string[], name?: string): Promise<FakeWalletMeta> {
    if (rows.length !== 8) {
      throw new InvalidSecretNumbersError();
    }
    return this.add('xrpl-seed', ['xrpl'], name);
  }

  async renameWallet(id: string, name: string): Promise<void> {
    this.require(id).name = name;
  }

  async removeWallet(id: string): Promise<void> {
    this.require(id);
    this.wallets = this.wallets.filter((w) => w.id !== id);
    if (this.activeId === id) {
      this.activeId = this.wallets[0]?.id ?? null;
    }
  }

  async markBackedUp(id: string): Promise<void> {
    this.require(id).backedUp = true;
  }

  exportMnemonic(id: string): string {
    if (this.require(id).type !== 'hd') {
      throw new UnsupportedChainError();
    }
    return VALID_MNEMONIC;
  }

  exportFamilySeed(id: string): string {
    this.require(id);
    return VALID_SEED;
  }

  getSigner(walletId: string, kind: ChainKind): Signer {
    if (!this.isUnlocked) {
      throw new KeyringLockedError();
    }
    const wallet = this.require(walletId);
    if (!wallet.chains.includes(kind)) {
      throw new UnsupportedChainError();
    }
    return {
      curve: kind === 'xrpl' ? 'ed25519' : 'secp256k1',
      publicKey: new TextEncoder().encode(`${walletId}/${kind}`),
      signDigest: async () => ({ signature: new Uint8Array(64), recovery: 0 }),
      signMessage: async () => ({ signature: new Uint8Array(64) }),
    };
  }

  async reset(): Promise<void> {
    this.initialized = false;
    this.isUnlocked = false;
    this.wallets = [];
    this.activeId = null;
  }

  private add(type: WalletType, chains: ChainKind[], name?: string): FakeWalletMeta {
    this.counter += 1;
    const wallet: FakeWalletMeta = {
      id: `wallet-${this.counter}`,
      name: name ?? `Wallet ${this.counter}`,
      type,
      chains,
      backedUp: false,
      createdAt: Date.now(),
    };
    this.wallets.push(wallet);
    this.activeId = wallet.id;
    this.initialized = true;
    this.isUnlocked = true;
    return { ...wallet };
  }

  private require(id: string): FakeWalletMeta {
    const wallet = this.wallets.find((w) => w.id === id);
    if (!wallet) {
      throw new WalletNotFoundError();
    }
    return wallet;
  }
}

// ---------------------------------------------------------------------------
// Fake chain adapters in a real ChainRegistry.
// ---------------------------------------------------------------------------

interface FakeAdapter extends ChainAdapter {
  getBalance: Mock<(address: string) => Promise<Balance>>;
  transfer: Mock<ChainAdapter['transfer']>;
  requestFaucet?: Mock<(address: string) => Promise<void>>;
}

function fakeAdapter(input: {
  chainId: string;
  kind: ChainKind;
  name: string;
  symbol: string;
  decimals: number;
  faucetUrl?: string;
}): FakeAdapter {
  const adapter: FakeAdapter = {
    config: {
      chainId: input.chainId,
      kind: input.kind,
      name: input.name,
      rpcUrl: 'http://localhost:1234',
      ...(input.faucetUrl ? { faucetUrl: input.faucetUrl } : {}),
      nativeCurrency: { symbol: input.symbol, decimals: input.decimals },
    },
    deriveAddress: (publicKey: Uint8Array) =>
      `${input.kind}-addr-${new TextDecoder().decode(publicKey)}`,
    isValidAddress: (address: string) => address.startsWith(`${input.kind}-`),
    getBalance: vi.fn(async (): Promise<Balance> => {
      return {
        symbol: input.symbol,
        decimals: input.decimals,
        amount: 1_000_000n,
        formatted: '1',
      };
    }),
    getRecentBlocks: async () => [],
    transfer: vi.fn(async (): Promise<TxResult> => ({ hash: '0xabc', success: true })),
  };
  if (input.faucetUrl) {
    adapter.requestFaucet = vi.fn(async () => undefined);
  }
  return adapter;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const XRPL_CHAIN = 'xrpl:testnet';
const EVM_CHAIN = 'evm:1449000';

let keyring: FakeKeyring;
let store: WalletStore;
let xrpl: FakeAdapter;
let evm: FakeAdapter;
let service: WalletService;

beforeEach(() => {
  keyring = new FakeKeyring();
  store = createWalletStore();
  xrpl = fakeAdapter({
    chainId: XRPL_CHAIN,
    kind: 'xrpl',
    name: 'XRPL Testnet',
    symbol: 'XRP',
    decimals: 6,
    faucetUrl: 'https://faucet.altnet.rippletest.net/accounts',
  });
  evm = fakeAdapter({
    chainId: EVM_CHAIN,
    kind: 'evm',
    name: 'XRPL EVM Testnet',
    symbol: 'XRP',
    decimals: 18,
  });
  service = new WalletService(
    keyring as unknown as KeyringManager,
    new ChainRegistry([xrpl, evm]),
    store,
  );
});

async function expectAppError(run: () => unknown, definition: { code: string }): Promise<void> {
  const error = await Promise.resolve()
    .then(run)
    .then(() => null)
    .catch((e: unknown) => e);
  expect(error).toBeInstanceOf(AppError);
  expect((error as AppError).code).toBe(definition.code);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WalletService.restore', () => {
  it('sets no_wallet when the keyring is not initialized', async () => {
    await service.restore();
    expect(store.getState()).toEqual({
      status: 'no_wallet',
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });
  });

  it('sets locked with empty wallets and accounts when initialized but locked', async () => {
    await service.createWallet();
    keyring.isUnlocked = false;
    await service.restore();
    expect(store.getState()).toEqual({
      status: 'locked',
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });
  });

  it('syncs wallets and accounts when initialized and unlocked', async () => {
    const created = await service.createWallet({ name: 'Main' });
    store.setState({
      status: 'idle',
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });

    await service.restore();

    const state = store.getState();
    expect(state.status).toBe('ready');
    expect(state.activeWalletId).toBe(created.id);
    expect(state.wallets).toEqual([
      {
        id: created.id,
        name: 'Main',
        type: 'hd',
        chains: ['xrpl', 'evm'],
        backedUp: false,
      },
    ]);
    expect(state.accounts).toHaveLength(2);
  });

  it('sets no_wallet when initialized and unlocked with zero wallets', async () => {
    keyring.initialized = true;
    keyring.isUnlocked = true;
    await service.restore();
    expect(store.getState().status).toBe('no_wallet');
  });
});

describe('WalletService wallet creation and import', () => {
  it('createWallet returns the wallet info and syncs the store', async () => {
    const info = await service.createWallet({ name: 'Main', words: 24 });

    expect(info).toEqual({
      id: 'wallet-1',
      name: 'Main',
      type: 'hd',
      chains: ['xrpl', 'evm'],
      backedUp: false,
    });
    const state = store.getState();
    expect(state.status).toBe('ready');
    expect(state.activeWalletId).toBe(info.id);
    expect(state.accounts.map((a) => a.kind)).toEqual(['xrpl', 'evm']);
    expect(state.accounts[0]).toEqual({
      chainId: XRPL_CHAIN,
      kind: 'xrpl',
      chainName: 'XRPL Testnet',
      symbol: 'XRP',
      address: 'xrpl-addr-wallet-1/xrpl',
    });
  });

  it('importMnemonic imports an hd wallet with accounts on every chain', async () => {
    const info = await service.importMnemonic(VALID_MNEMONIC, 'Imported');

    expect(info.type).toBe('hd');
    expect(info.name).toBe('Imported');
    const state = store.getState();
    expect(state.status).toBe('ready');
    expect(state.wallets).toHaveLength(1);
    expect(state.accounts).toHaveLength(2);
  });

  it('importMnemonic maps InvalidMnemonicError to INVALID_MNEMONIC', async () => {
    await expectAppError(
      () => service.importMnemonic('not a phrase'),
      WalletErrors.INVALID_MNEMONIC,
    );
    expect(store.getState().status).toBe('idle');
  });

  it('importFamilySeed creates an xrpl-seed wallet with only the xrpl account', async () => {
    const info = await service.importFamilySeed(VALID_SEED, 'Seed wallet');

    expect(info.type).toBe('xrpl-seed');
    expect(info.chains).toEqual(['xrpl']);
    const state = store.getState();
    expect(state.status).toBe('ready');
    expect(state.accounts).toHaveLength(1);
    expect(state.accounts[0]?.chainId).toBe(XRPL_CHAIN);
  });

  it('importFamilySeed maps InvalidFamilySeedError to INVALID_FAMILY_SEED', async () => {
    await expectAppError(
      () => service.importFamilySeed('garbage'),
      WalletErrors.INVALID_FAMILY_SEED,
    );
  });

  it('importSecretNumbers creates an xrpl-seed wallet with only the xrpl account', async () => {
    const info = await service.importSecretNumbers(VALID_ROWS);

    expect(info.type).toBe('xrpl-seed');
    const state = store.getState();
    expect(state.accounts.map((a) => a.kind)).toEqual(['xrpl']);
  });

  it('importSecretNumbers maps InvalidSecretNumbersError to INVALID_SECRET_NUMBERS', async () => {
    await expectAppError(
      () => service.importSecretNumbers(['1', '2']),
      WalletErrors.INVALID_SECRET_NUMBERS,
    );
  });
});

describe('WalletService wallet management', () => {
  it('setActiveWallet switches the active wallet and re-derives accounts', async () => {
    const hd = await service.createWallet({ name: 'HD' });
    const seed = await service.importFamilySeed(VALID_SEED, 'Seed');
    expect(store.getState().activeWalletId).toBe(seed.id);
    expect(store.getState().accounts).toHaveLength(1);

    await service.setActiveWallet(hd.id);

    const state = store.getState();
    expect(state.activeWalletId).toBe(hd.id);
    expect(state.accounts).toHaveLength(2);
    expect(state.wallets).toHaveLength(2);
  });

  it('setActiveWallet maps WalletNotFoundError to NOT_INITIALIZED', async () => {
    await service.createWallet();
    await expectAppError(() => service.setActiveWallet('missing'), WalletErrors.NOT_INITIALIZED);
  });

  it('renameWallet syncs the new name into the store', async () => {
    const info = await service.createWallet({ name: 'Old' });
    await service.renameWallet(info.id, 'New');
    expect(store.getState().wallets[0]?.name).toBe('New');
  });

  it('removeWallet removes the wallet and falls back to the remaining one', async () => {
    const first = await service.createWallet({ name: 'First' });
    const second = await service.createWallet({ name: 'Second' });

    await service.removeWallet(second.id);

    const state = store.getState();
    expect(state.status).toBe('ready');
    expect(state.wallets.map((w) => w.id)).toEqual([first.id]);
    expect(state.activeWalletId).toBe(first.id);
  });

  it('removeWallet of the last wallet sets no_wallet', async () => {
    const info = await service.createWallet();
    await service.removeWallet(info.id);
    expect(store.getState()).toEqual({
      status: 'no_wallet',
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });
  });

  it('markBackedUp flips the backedUp flag in the store', async () => {
    const info = await service.createWallet();
    expect(store.getState().wallets[0]?.backedUp).toBe(false);
    await service.markBackedUp(info.id);
    expect(store.getState().wallets[0]?.backedUp).toBe(true);
  });
});

describe('WalletService.exportMnemonic / exportFamilySeed', () => {
  it('export defaults to the active wallet', async () => {
    await service.createWallet();
    expect(service.exportMnemonic()).toBe(VALID_MNEMONIC);
    expect(service.exportFamilySeed()).toBe(VALID_SEED);
  });

  it('exportMnemonic maps UnsupportedChainError for xrpl-seed wallets', async () => {
    await service.importFamilySeed(VALID_SEED);
    await expectAppError(() => service.exportMnemonic(), WalletErrors.UNSUPPORTED_CHAIN);
  });

  it('export throws NOT_INITIALIZED without a wallet', async () => {
    await service.restore();
    await expectAppError(() => service.exportMnemonic(), WalletErrors.NOT_INITIALIZED);
  });
});

describe('WalletService.getBalance', () => {
  it('queries the balance of the active wallet account', async () => {
    await service.createWallet();
    const balance = await service.getBalance(XRPL_CHAIN);
    expect(balance.formatted).toBe('1');
    expect(xrpl.getBalance).toHaveBeenCalledWith('xrpl-addr-wallet-1/xrpl');
  });

  it('throws UNKNOWN_CHAIN when no adapter is registered', async () => {
    await service.createWallet();
    await expectAppError(() => service.getBalance('solana:devnet'), WalletErrors.UNKNOWN_CHAIN);
  });

  it('throws UNSUPPORTED_CHAIN when the active wallet does not support the chain kind', async () => {
    await service.importFamilySeed(VALID_SEED);
    await expectAppError(() => service.getBalance(EVM_CHAIN), WalletErrors.UNSUPPORTED_CHAIN);
  });

  it('throws NOT_INITIALIZED when no wallet exists', async () => {
    await service.restore();
    await expectAppError(() => service.getBalance(XRPL_CHAIN), WalletErrors.NOT_INITIALIZED);
  });

  it('throws WALLET_LOCKED when the keyring is locked', async () => {
    await service.createWallet();
    keyring.isUnlocked = false;
    await service.restore();
    await expectAppError(() => service.getBalance(XRPL_CHAIN), WalletErrors.WALLET_LOCKED);
  });
});

describe('WalletService.send', () => {
  it('signs with the active wallet and transfers in base units', async () => {
    await service.createWallet();

    const result = await service.send(XRPL_CHAIN, 'xrpl-destination', '1.5');

    expect(result).toEqual({ hash: '0xabc', success: true });
    expect(xrpl.transfer).toHaveBeenCalledTimes(1);
    const [params, signer] = xrpl.transfer.mock.calls[0] ?? [];
    expect(params).toEqual({
      from: 'xrpl-addr-wallet-1/xrpl',
      to: 'xrpl-destination',
      amount: 1_500_000n,
    });
    expect(signer?.curve).toBe('ed25519');
  });

  it('throws INVALID_ADDRESS for an invalid destination', async () => {
    await service.createWallet();
    await expectAppError(
      () => service.send(XRPL_CHAIN, 'evm-wrong-network', '1'),
      WalletErrors.INVALID_ADDRESS,
    );
    expect(xrpl.transfer).not.toHaveBeenCalled();
  });

  it('throws WALLET_LOCKED when the wallet is locked', async () => {
    await service.createWallet();
    keyring.isUnlocked = false;
    await service.restore();
    await expectAppError(
      () => service.send(XRPL_CHAIN, 'xrpl-destination', '1'),
      WalletErrors.WALLET_LOCKED,
    );
  });

  it('throws UNSUPPORTED_CHAIN when the active wallet cannot use the chain', async () => {
    await service.importFamilySeed(VALID_SEED);
    await expectAppError(
      () => service.send(EVM_CHAIN, 'evm-destination', '1'),
      WalletErrors.UNSUPPORTED_CHAIN,
    );
    expect(evm.transfer).not.toHaveBeenCalled();
  });

  it('throws UNKNOWN_CHAIN for an unregistered chain', async () => {
    await service.createWallet();
    await expectAppError(
      () => service.send('solana:devnet', 'somewhere', '1'),
      WalletErrors.UNKNOWN_CHAIN,
    );
  });
});

describe('WalletService.requestFaucetFunds', () => {
  it('asks the adapter faucet to fund the active account', async () => {
    await service.createWallet();
    await service.requestFaucetFunds(XRPL_CHAIN);
    expect(xrpl.requestFaucet).toHaveBeenCalledWith('xrpl-addr-wallet-1/xrpl');
  });

  it('throws FAUCET_UNAVAILABLE when the adapter has no faucet', async () => {
    await service.createWallet();
    await expectAppError(
      () => service.requestFaucetFunds(EVM_CHAIN),
      WalletErrors.FAUCET_UNAVAILABLE,
    );
  });

  it('throws WALLET_LOCKED when locked', async () => {
    await service.createWallet();
    keyring.isUnlocked = false;
    await service.restore();
    await expectAppError(() => service.requestFaucetFunds(XRPL_CHAIN), WalletErrors.WALLET_LOCKED);
  });
});

describe('WalletService keyring error mapping', () => {
  it('maps KeyringLockedError raised by getSigner to WALLET_LOCKED', async () => {
    const info = await service.createWallet();
    // Lock the keyring without re-running restore: the next sync hits getSigner.
    keyring.isUnlocked = false;
    await expectAppError(() => service.setActiveWallet(info.id), WalletErrors.WALLET_LOCKED);
  });

  it('maps WalletNotFoundError to NOT_INITIALIZED', async () => {
    await service.createWallet();
    await expectAppError(() => service.renameWallet('missing', 'x'), WalletErrors.NOT_INITIALIZED);
    await expectAppError(() => service.exportFamilySeed('missing'), WalletErrors.NOT_INITIALIZED);
  });
});

describe('WalletService.reset', () => {
  it('clears the keyring and resets the store to no_wallet', async () => {
    await service.createWallet();
    await service.reset();
    expect(keyring.wallets).toHaveLength(0);
    expect(store.getState()).toEqual({
      status: 'no_wallet',
      wallets: [],
      activeWalletId: null,
      accounts: [],
    });
  });
});
