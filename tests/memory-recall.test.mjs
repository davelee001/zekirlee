import assert from "node:assert/strict";
import test from "node:test";
import { recallForChat, memoryPrompt } from "../src/lib/memory/recall.ts";
import { createChatHandler } from "../src/lib/ai/chat-handler.ts";
import { serializeChatRequest } from "../src/lib/ai/session.ts";
import { MemWalMock } from "@mysten-incubation/memwal";
import { storeUsefulFacts } from "../src/lib/memory/storage.ts";

const defaults = () => ({ enabled: true, query: "What should I build?", signal: new AbortController().signal });

test("stored facts can be recalled with an empty conversation using the SDK mock", async () => {
  const client = MemWalMock.create({ namespace: "guest:test" });
  const stored = await storeUsefulFacts({
    text: "I prefer TypeScript", namespace: "guest:test", writer: client,
    extract: async () => ({ facts: [{ text: "User prefers TypeScript", evidence: "I prefer TypeScript" }] }),
  });
  assert.equal(stored.saved, 1);
  const recalled = await recallForChat({ ...defaults(), query: "User prefers TypeScript", loadClient: async () => client });
  assert.equal(recalled.status, "recalled");
  assert.deepEqual(recalled.facts, ["User prefers TypeScript"]);
});

test("memory off skips all configuration and network access", async () => {
  assert.deepEqual(await recallForChat({ ...defaults(), enabled: false, loadClient: async () => assert.fail("Must not access memory") }), { status: "off", facts: [] });
});

test("new identities and empty search results provide no saved context", async () => {
  assert.equal((await recallForChat({ ...defaults(), loadClient: async () => null })).status, "new");
  assert.equal((await recallForChat({ ...defaults(), loadClient: async () => ({ recall: async () => ({ results: [] }) }) })).status, "empty");
});

test("recall selects relevant, bounded, unique facts", async () => {
  const result = await recallForChat({ ...defaults(), loadClient: async () => ({ recall: async options => {
    assert.equal(options.query, "What should I build?");
    assert.equal(options.topK, 5);
    assert.equal(options.maxTokens, 600);
    return { results: [
      { text: "User likes TypeScript", distance: 0.2 },
      { text: "user likes typescript", distance: 0.3 },
      { text: "irrelevant", distance: 0.9 },
      { text: "x".repeat(501), distance: 0.1 },
      { text: "User studies Move", distance: 0.4 },
    ] };
  } }) });
  assert.deepEqual(result, { status: "recalled", facts: ["User likes TypeScript", "User studies Move"] });
  assert.match(memoryPrompt(result.facts), /untrusted data/);
  assert.match(memoryPrompt(result.facts), /Current user statements override old facts/);
  assert.equal(memoryPrompt([]), "");
});

test("failed or stalled memory returns a fallback without throwing", async () => {
  for (const loadClient of [async () => { throw Error("private key error"); }, () => new Promise(() => {})]) {
    assert.deepEqual(await recallForChat({ ...defaults(), loadClient, timeoutMs: 10 }), { status: "unavailable", facts: [] });
  }
});

test("request cancellation stops waiting for memory", async () => {
  const controller = new AbortController();
  const result = recallForChat({ ...defaults(), signal: controller.signal, loadClient: () => new Promise(() => {}) });
  controller.abort();
  assert.equal((await result).status, "unavailable");
});

test("chat passes explicit consent and reports recall without disclosing facts in headers", async () => {
  const messages = [{ role: "user", text: "Hello" }];
  for (const enabled of [false, true]) {
