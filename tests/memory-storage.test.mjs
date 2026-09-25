import assert from "node:assert/strict";
import test from "node:test";
import { memoryIdentity } from "../src/lib/memory/identity.ts";
import { storeUsefulFacts } from "../src/lib/memory/storage.ts";

test("signed memory cookies isolate guests and reject tampering or key rotation", () => {
  const key = "a".repeat(64);
  const first = memoryIdentity(undefined, key);
  assert.equal(first.existing, false);
  assert.equal(memoryIdentity(first.token, key).id, first.id);
  assert.equal(memoryIdentity(first.token, key).existing, true);
  assert.notEqual(memoryIdentity(undefined, key).id, first.id);
  for (const token of [first.id, first.token + ".extra", first.token.slice(0, -1) + "z"]) {
    assert.equal(memoryIdentity(token, key).existing, false);
  }
  assert.equal(memoryIdentity(first.token, "b".repeat(64)).existing, false);
});

test("only supported useful facts are stored and duplicate facts share one write", async () => {
  const writes = [];
  const result = await storeUsefulFacts({
    text: "I prefer TypeScript.", namespace: "guest:one",
    extract: async () => ({ facts: [
      { text: "User prefers TypeScript.", evidence: "I prefer TypeScript." },
