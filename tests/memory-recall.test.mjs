import assert from "node:assert/strict";
import test from "node:test";
import { recallForChat, memoryPrompt } from "../src/lib/memory/recall.ts";
import { createChatHandler } from "../src/lib/ai/chat-handler.ts";
import { serializeChatRequest } from "../src/lib/ai/session.ts";
import { MemWalMock } from "@mysten-incubation/memwal";
import { storeUsefulFacts } from "../src/lib/memory/storage.ts";

