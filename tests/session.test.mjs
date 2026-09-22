import assert from "node:assert/strict";
import test from "node:test";
import { restoreMessages, serializeChatRequest } from "../src/lib/ai/session.ts";

test("context includes early messages beyond the previous seven-message window", () => {
  const messages = [{ role: "user", text: "My project is called Mango." }];
  for (let i = 0; i < 5; i++) {
    messages.push({ role: "assistant", text: "Let's discuss your project." }, { role: "user", text: "Tell me more." });
  }
  const sent = JSON.parse(serializeChatRequest(messages)).messages;
  assert.deepEqual(sent, messages);
  assert.match(sent[0].text, /Mango/);
});

test("tab history survives serialization and retains message ordering", () => {
  const messages = [{ role: "user", text: "Hello" }, { role: "assistant", text: "Welcome!" }];
  assert.deepEqual(restoreMessages(JSON.stringify(messages)), messages);
  assert.deepEqual(restoreMessages(JSON.stringify([])), []);
});

