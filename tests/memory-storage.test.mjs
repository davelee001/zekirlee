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
      { text: "User prefers TypeScript.", evidence: "I prefer TypeScript." },
      { text: "User lives in Paris.", evidence: "I live in Paris." },
    ] }),
    writer: { rememberAndWait: async (...args) => { writes.push(args); return { blob_id: "blob" }; } },
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], "User prefers TypeScript.");
  assert.deepEqual(result, { saved: 1, failed: 0, skipped: false });
});

test("credential messages and ordinary messages without facts cause no storage", async () => {
  const writer = { rememberAndWait: async () => assert.fail("Must not store") };
  const result = await storeUsefulFacts({
    text: "My password is private", namespace: "one", writer,
    extract: async () => assert.fail("Must not extract credential-bearing text"),
  });
  assert.equal(result.skipped, true);
  assert.equal((await storeUsefulFacts({ text: "Hello", namespace: "one", writer, extract: async () => ({ facts: [] }) })).saved, 0);
});

test("identical retries reuse idempotency keys and namespaces separate writes", async () => {
  const keys = [];
  const input = {
    text: "I use TypeScript", namespace: "one",
    extract: async () => ({ facts: [{ text: "User uses TypeScript", evidence: "I use TypeScript" }] }),
    writer: { rememberAndWait: async (_text, _namespace, options) => { keys.push(options.idempotencyKey); return { blob_id: "blob" }; } },
  };
  await storeUsefulFacts(input);
  await storeUsefulFacts(input);
  await storeUsefulFacts({ ...input, namespace: "two" });
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[1], keys[2]);
});

test("partial storage failures are not reported as successful saves", async () => {
  const result = await storeUsefulFacts({
    text: "I use TypeScript. I study Move.", namespace: "one",
    extract: async () => ({ facts: [
      { text: "User uses TypeScript", evidence: "I use TypeScript." },
      { text: "User studies Move", evidence: "I study Move." },
    ] }),
    writer: { rememberAndWait: async text => {
      if (text.includes("Move")) throw Error("secret provider error");
      return { blob_id: "blob" };
    } },
  });
  assert.deepEqual(result, { saved: 1, failed: 1, skipped: false });
});

test("malformed extraction fails before storage", async () => {
