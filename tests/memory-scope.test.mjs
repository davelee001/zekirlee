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
  for (const override of [{ userId: generation }, { generation: userId }]) {
    const next = await resolveMemoryScope(config, undefined, async () => ({ ...await account(), ...override }));
    assert.notEqual(original.namespace, next.namespace);
  }
});
test('guests keep their existing namespace and must establish a cookie before writes', async () => {
  const identity = memoryIdentity(undefined, config.key);
  const guest = await resolveMemoryScope(config, identity.token, async () => null);
  assert.equal(guest.namespace, `test:guest:${identity.id}`);
  assert.equal(guest.scope, 'browser');
  assert.equal(guest.existing, true);
  const fresh = await resolveMemoryScope(config, 'tampered', async () => null);
  assert.equal(fresh.existing, false);
});
test('authentication and database failures never fall back to guest memory', async () => {
  await assert.rejects(resolveMemoryScope(config, memoryIdentity(undefined, config.key).token,
    async () => { throw new Error('Auth unavailable'); }), /Auth unavailable/);
  await assert.rejects(resolveMemoryScope(config, undefined, async () => ({ ...await account(), userId: 'untrusted' })), /Invalid/);
});
test('account clearing reports its scope without changing the guest cookie', async () => {
  let clears = 0;
  const handlers = createMemoryManagementHandlers(async () => ({ state: 'known', scope: 'account',
    stats: async () => 3, forget: async () => { clears++; return 3; } }));
  const response = await handlers.DELETE(new Request('https://app.example/api/memory/manage', {
    method: 'DELETE', headers: { origin: 'https://app.example', 'X-Zekirlee-Confirm': 'forget-memory' },
  }));
