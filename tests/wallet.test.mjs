import test from 'node:test';
import assert from 'node:assert/strict';
import { getWallets } from '@mysten/wallet-standard';
import { dAppKit } from '../src/lib/wallet/dapp-kit.ts';

function fixture({ reject = false, chain = 'sui:mainnet' } = {}) {
  const accounts = ['1', '2'].map(digit => ({ address: `0x${digit.repeat(64)}`, publicKey: new Uint8Array(32),
    chains: [chain], features: ['sui:signTransaction'] }));
  let connects = 0, disconnects = 0;
  const wallet = { version: '1.0.0', name: 'ZekirLee test wallet', icon: 'data:image/png;base64,AA==',
    chains: [chain], accounts, features: {
      'standard:connect': { version: '1.0.0', connect: async () => {
        connects++; if (reject) throw Error('User rejected'); return { accounts };
      } },
      'standard:disconnect': { version: '1.0.0', disconnect: async () => { disconnects++; } },
      'standard:events': { version: '1.0.0', on: () => () => {} },
      'sui:signTransaction': { version: '2.0.0', signTransaction: async () => assert.fail('Connection must not sign') },
    } };
  const unregister = getWallets().register(wallet);
  const unlisten = dAppKit.stores.$wallets.listen(() => {});
  return { accounts, connects: () => connects, disconnects: () => disconnects,
    ui: () => dAppKit.stores.$wallets.get().find(item => item.name === wallet.name),
    cleanup: () => { unregister(); unlisten(); } };
}

test('wallet discovery does not connect automatically or require a signing request', async () => {
  const wallet = fixture();
  try {
    assert.equal(wallet.connects(), 0);
    assert.equal(dAppKit.stores.$connection.get().status, 'disconnected');
    assert.equal(dAppKit.stores.$currentNetwork.get(), 'mainnet');
    const connected = await dAppKit.connectWallet({ wallet: wallet.ui() });
    assert.equal(wallet.connects(), 1);
    assert.equal(dAppKit.stores.$connection.get().account.address, wallet.accounts[0].address);
    dAppKit.switchAccount({ account: connected.accounts[1] });
    assert.equal(dAppKit.stores.$connection.get().account.address, wallet.accounts[1].address);
    await dAppKit.disconnectWallet();
    assert.equal(wallet.disconnects(), 1);
    assert.equal(dAppKit.stores.$connection.get().account, null);
  } finally { wallet.cleanup(); }
});

test('rejected connections leave the application disconnected', async () => {
  const wallet = fixture({ reject: true });
  try {
    await assert.rejects(dAppKit.connectWallet({ wallet: wallet.ui() }), /User rejected/);
    assert.equal(dAppKit.stores.$connection.get().status, 'disconnected');
    assert.equal(dAppKit.stores.$connection.get().account, null);
  } finally { wallet.cleanup(); }
});

test('wallets without mainnet support are excluded', () => {
  const wallet = fixture({ chain: 'sui:testnet' });
  try { assert.equal(wallet.ui(), undefined); }
