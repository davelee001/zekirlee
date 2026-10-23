import assert from "node:assert/strict";
import { createHash, createPublicKey, verify } from "node:crypto";
import test from "node:test";
import { createMemoryManagementHandlers } from "../src/lib/memory/management.ts";
import { memoryAdminRequest } from "../src/lib/memory/relayer-admin.ts";

const url = "https://zekirlee.example/api/memory/manage";
const request = (method, headers = {}) => new Request(url, { method, headers });
const confirmed = { origin: "https://zekirlee.example", "x-zekirlee-confirm": "forget-memory" };
const known = (overrides = {}) => ({ state: "known", stats: async () => 3, forget: async () => 3,
  replacementCookie: "zekirlee-memory=new-token; HttpOnly; SameSite=Strict; Path=/", ...overrides });

test("memory status distinguishes configuration, new identity, and verified counts", async () => {
  for (const state of ["unconfigured", "new"]) {
    const response = await createMemoryManagementHandlers(async () => ({ state })).GET(request("GET"));
    assert.deepEqual(await response.json(), { state, count: 0 });
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
  const response = await createMemoryManagementHandlers(async () => known()).GET(request("GET"));
  assert.deepEqual(await response.json(), { state: "ready", count: 3 });
  assert.equal(response.headers.has("set-cookie"), false);
});

test("clearing requires same-origin confirmation before resolving a memory identity", async () => {
  const handlers = createMemoryManagementHandlers(async () => assert.fail("Must not access memory"));
  assert.equal((await handlers.DELETE(request("DELETE"))).status, 403);
  assert.equal((await handlers.DELETE(request("DELETE", { ...confirmed, origin: "https://other.example" }))).status, 403);
  assert.equal((await handlers.DELETE(request("DELETE", { origin: confirmed.origin }))).status, 400);
  assert.equal((await handlers.GET(request("GET", { "sec-fetch-site": "cross-site" }))).status, 403);
});

test("clear succeeds only for the resolved identity and then replaces its cookie", async () => {
  let calls = 0;
  const handlers = createMemoryManagementHandlers(async () => known({ forget: async () => { calls++; return 2; } }));
  const response = await handlers.DELETE(new Request(url + "?namespace=someone-else", { method: "DELETE", headers: confirmed }));
  assert.equal(calls, 1);
  assert.deepEqual(await response.json(), { cleared: 2, state: "new" });
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
});

test("failed management masks provider errors and preserves the cookie for retry", async () => {
  const fail = async () => { throw Error("secret-account-key"); };
  const handlers = createMemoryManagementHandlers(async () => known({ stats: fail, forget: fail }));
  for (const response of [await handlers.GET(request("GET")), await handlers.DELETE(request("DELETE", confirmed))]) {
