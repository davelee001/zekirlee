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
