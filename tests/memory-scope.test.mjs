import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMemoryScope } from '../src/lib/memory/scope.ts';
import { memoryIdentity } from '../src/lib/memory/identity.ts';
import { createMemoryManagementHandlers } from '../src/lib/memory/management.ts';

const config = { namespace: 'test', key: '11'.repeat(32) };
const userId = '11111111-1111-4111-8111-111111111111';
const generation = '22222222-2222-4222-8222-222222222222';
const account = async () => ({ userId, generation, rotate: async () => {} });

test('account memory uses the same namespace on devices with different guest cookies', async () => {
  const one = await resolveMemoryScope(config, memoryIdentity(undefined, config.key).token, account);
  const two = await resolveMemoryScope(config, undefined, account);
  assert.equal(one.namespace, two.namespace);
  assert.equal(one.scope, 'account');
  assert.equal(one.existing, true);
  assert.equal(one.token, undefined);
});
test('different accounts and rotated generations cannot share memory namespaces', async () => {
  const original = await resolveMemoryScope(config, undefined, account);
