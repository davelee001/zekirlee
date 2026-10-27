import test from 'node:test';
import assert from 'node:assert/strict';
import { getWallets } from '@mysten/wallet-standard';
import { dAppKit } from '../src/lib/wallet/dapp-kit.ts';

function fixture({ reject = false, chain = 'sui:mainnet' } = {}) {
  const accounts = ['1', '2'].map(digit => ({ address: `0x${digit.repeat(64)}`, publicKey: new Uint8Array(32),
    chains: [chain], features: ['sui:signTransaction'] }));
