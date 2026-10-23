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
    assert.equal(response.status, 503);
    assert.equal(response.headers.has("set-cookie"), false);
    assert.doesNotMatch(await response.text(), /secret-account-key/);
  }
});

test("new or unconfigured browsers never trigger a remote clear", async () => {
  const fresh = await createMemoryManagementHandlers(async () => ({ state: "new" })).DELETE(request("DELETE", confirmed));
  assert.deepEqual(await fresh.json(), { cleared: 0, state: "new" });
  assert.equal(fresh.headers.has("set-cookie"), false);
  const missing = await createMemoryManagementHandlers(async () => ({ state: "unconfigured" })).DELETE(request("DELETE", confirmed));
  assert.equal(missing.status, 503);
});

// Public RFC 8032 test seed, never an application credential.
const config = { key: "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60", accountId: `0x${"a".repeat(64)}`, serverUrl: "https://relayer.example" };

test("admin requests bind account, namespace, method, path, body, and nonce to an Ed25519 signature", async () => {
  const nonces = new Set();
  for (const operation of ["stats", "forget"]) {
    const count = await memoryAdminRequest(config, operation, "zekirlee:guest:one", async (target, options) => {
      assert.equal(target, `${config.serverUrl}/api/${operation}`);
      assert.equal(options.redirect, "error");
      const headers = options.headers;
      assert.equal(headers["x-public-key"], "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
      assert.equal(headers["x-account-id"], config.accountId);
      assert.equal(headers["x-delegate-key"], undefined);
      assert.doesNotMatch(JSON.stringify(options.headers), new RegExp(config.key));
