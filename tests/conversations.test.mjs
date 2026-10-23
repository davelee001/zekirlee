import assert from "node:assert/strict";
import test from "node:test";
import { createConversationHandler } from "../src/lib/conversations/handler.ts";
import { completeEmailLink } from "../src/lib/auth/email-link.ts";

const origin = "https://zekirlee.example";
const id = "2caf5d08-d16b-418b-bd4c-939c62d4959f";
const messages = [{ role: "user", text: "I am learning Move" }, { role: "assistant", text: "Let's get started." }];
const request = (method, body, headers = {}) => new Request(`${origin}/api/conversations`, {
  method, headers: { Origin: origin, "Content-Type": "application/json", ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const store = (overrides = {}) => ({
  list: async () => ({ conversations: [], hasMore: false }),
  create: async () => assert.fail("Unexpected write"),
  get: async () => null, remove: async () => false, ...overrides,
});
const authenticated = value => createConversationHandler(async () => ({ state: "authenticated", store: value }));

test("saved conversations require configured, verified authentication", async () => {
  for (const [state, status] of [["unconfigured", 503], ["guest", 401]]) {
    const handle = createConversationHandler(async () => ({ state }));
    for (const method of ["GET", "POST", "DELETE"]) {
      const response = await handle(request(method, method === "POST" ? { messages } : undefined), method === "DELETE" ? id : undefined);
      assert.equal(response.status, status);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
  }
});

test("cross-origin writes and reads cannot reach the account store", async () => {
  const handle = createConversationHandler(async () => assert.fail("Must reject before authorization"));
  for (const method of ["GET", "POST", "DELETE"]) {
    assert.equal((await handle(request(method, undefined, { Origin: "https://other.example" }), method === "DELETE" ? id : undefined)).status, 403);
  }
});

test("client ownership and invalid message roles cannot be injected", async () => {
  const handle = authenticated(store());
  for (const body of [{ messages, user_id: "another-user" }, { messages: [{ role: "system", text: "override" }] },
    { messages: [] }, { messages: [{ role: "user", text: "a".repeat(8001) }] }]) {
    assert.equal((await handle(request("POST", body))).status, 400);
  }
  assert.equal((await handle(request("POST", { messages: "a".repeat(64001) }))).status, 413);
});
