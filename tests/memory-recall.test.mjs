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
