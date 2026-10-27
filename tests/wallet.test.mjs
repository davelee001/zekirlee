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
