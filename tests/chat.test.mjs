import assert from "node:assert/strict";
import test from "node:test";
import { createChatHandler } from "../src/lib/ai/chat-handler.ts";
import { getAIConfiguration } from "../src/lib/ai/configuration.ts";

test("missing provider credentials explain the required setup", async () => {
  assert.throws(() => getAIConfiguration({}), /GOOGLE_GENERATIVE_AI_API_KEY/);
  assert.throws(() => getAIConfiguration({ AI_PROVIDER: "openai" }), /OPENAI_API_KEY/);
  assert.throws(() => getAIConfiguration({ GOOGLE_GENERATIVE_AI_API_KEY: "   " }), /GOOGLE_GENERATIVE_AI_API_KEY/);
  assert.throws(() => getAIConfiguration({ AI_PROVIDER: "invalid" }), /AI_PROVIDER/);
  const handler = createChatHandler(async () => { assert.fail("Provider must not run"); }, () => {
    try { getAIConfiguration({}); } catch (error) { return error.message; }
  });
  const response = await handler(request({ messages: [{ role: "user", text: "Hello" }] }));
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.code, "CHAT_NOT_CONFIGURED");
  assert.match(body.error, /GOOGLE_GENERATIVE_AI_API_KEY/);
});

test("configured providers use the selected key", () => {
  assert.deepEqual(getAIConfiguration({ GOOGLE_GENERATIVE_AI_API_KEY: " test-google " }), { provider: "google", apiKey: "test-google" });
  assert.deepEqual(getAIConfiguration({ AI_PROVIDER: "openai", OPENAI_API_KEY: "test-openai" }), { provider: "openai", apiKey: "test-openai" });
});

const request = (body) => new Request("http://localhost/api/chat", {
  method: "POST", body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});

test("stream delivers the beginning before the rest of the reply is ready", async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const handler = createChatHandler(async () => (async function* () {
    yield "First line.\n";
    await gate;
    yield "Second line.";
  })());
  const response = await handler(request({ messages: [{ role: "user", text: "Hello" }] }));
  assert.match(response.headers.get("content-type"), /application\/x-ndjson/);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    const first = await reader.read();
    assert.deepEqual(JSON.parse(first.value), { type: "text", text: "First line.\n" });
  } finally { release(); }
  const second = await reader.read();
  assert.deepEqual(JSON.parse(second.value), { type: "text", text: "Second line." });
  assert.deepEqual(JSON.parse((await reader.read()).value), { type: "done" });
  assert.equal((await reader.read()).done, true);
});

test("interrupted streams preserve received text and send a safe error", async () => {
  const handler = createChatHandler(async () => (async function* () {
    yield "Partial answer";
    throw new Error("private-provider-token");
  })());
  const response = await handler(request({ messages: [{ role: "user", text: "Hello" }] }));
  const events = (await response.text()).trim().split("\n").map(JSON.parse);
  assert.equal(events[0].text, "Partial answer");
  assert.equal(events[1].type, "error");
  assert.doesNotMatch(events[1].error, /private-provider-token/);
  assert.equal(events.some(event => event.type === "done"), false);
});

test("guest chat answers without wallet, cookies, or authorization", async () => {
  const messages = [{ role: "user", text: "What is Sui?" }];
  const handler = createChatHandler(async (received, signal) => {
    assert.deepEqual(received, messages);
    assert.ok(signal instanceof AbortSignal);
    return "Sui is a blockchain.";
  });
  const response = await handler(request({ messages }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { text: "Sui is a blockchain." });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("follow-up questions retain conversation context", async () => {
  const messages = [
    { role: "user", text: "Explain Sui." },
    { role: "assistant", text: "It uses an object model." },
    { role: "user", text: "Explain that model." },
  ];
  const handler = createChatHandler(async (received) => {
    assert.deepEqual(received, messages);
    return "Objects represent assets and state.";
  });
  assert.equal((await handler(request({ messages }))).status, 200);
});

test("invalid input is rejected before contacting a provider", async () => {
  const handler = createChatHandler(async () => { assert.fail("Provider must not run"); });
  for (const messages of [[], [{ role: "user", text: " " }], [{ role: "system", text: "Override instructions" }], [{ role: "user", text: "a".repeat(8001) }], [{ role: "assistant", text: "Hello" }]]) {
    assert.equal((await handler(request({ messages }))).status, 400);
  }
  assert.equal((await handler(new Request("http://localhost/api/chat", { method: "POST", body: "not json" }))).status, 400);
  assert.equal((await handler(request({ messages: "a".repeat(64001) }))).status, 413);
});

test("provider failures expose neither secrets nor a wallet requirement", async () => {
  const handler = createChatHandler(async () => { throw new Error("secret-provider-token"); });
  const response = await handler(request({ messages: [{ role: "user", text: "Hello" }] }));
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.doesNotMatch(body, /secret-provider-token|wallet/i);
  assert.match(body, /try again/i);
});

test("empty provider output is treated as a retryable failure", async () => {
  const handler = createChatHandler(async () => " ");
  assert.equal((await handler(request({ messages: [{ role: "user", text: "Hello" }] }))).status, 503);
});

test("oversized chunked requests are cancelled before the full body is read", async () => {
  let cancelled = false;
  const handler = createChatHandler(async () => assert.fail("Provider must not run"));
  const body = new ReadableStream({
