import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMemoryScope } from '../src/lib/memory/scope.ts';
import { memoryIdentity } from '../src/lib/memory/identity.ts';
import { createMemoryManagementHandlers } from '../src/lib/memory/management.ts';

const config = { namespace: 'test', key: '11'.repeat(32) };
const userId = '11111111-1111-4111-8111-111111111111';
