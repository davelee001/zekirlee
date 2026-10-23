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

test("authenticated users can create, list, open, and confirm deletion of a snapshot", async () => {
  let saved = null;
  const handle = authenticated(store({
    create: async received => { assert.deepEqual(received, messages); saved = { id, title: "I am learning Move", created_at: "2026-10-23T10:00:00Z", messages: received }; return { id, title: saved.title, created_at: saved.created_at }; },
    list: async page => { assert.equal(page, 0); return { conversations: saved ? [{ id, title: saved.title, created_at: saved.created_at }] : [], hasMore: false }; },
    get: async key => key === saved?.id ? saved : null,
    remove: async key => { if (key !== saved?.id) return false; saved = null; return true; },
  }));
  assert.equal((await handle(request("POST", { messages }))).status, 201);
  const listing = await (await handle(request("GET"))).json();
  assert.equal(listing.conversations.length, 1);
  assert.equal(listing.conversations[0].messages, undefined);
  assert.deepEqual((await (await handle(request("GET"), id)).json()).conversation.messages, messages);
  assert.equal((await handle(request("DELETE"), id)).status, 400);
  assert.equal((await handle(request("DELETE", undefined, { "X-Zekirlee-Confirm": "delete-conversation" }), id)).status, 200);
  assert.equal((await handle(request("GET"), id)).status, 404);
});

test("invalid IDs, pagination, missing rows, and storage failures return safe errors", async () => {
  const handle = authenticated(store());
  assert.equal((await handle(request("GET"), "invalid")).status, 400);
  assert.equal((await handle(new Request(origin + "/api/conversations?page=-1"))).status, 400);
  assert.equal((await handle(request("GET"), id)).status, 404);
  const fail = authenticated(store({ list: async () => { throw Error("database-secret-password"); } }));
  const response = await fail(request("GET"));
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /database-secret-password/);
