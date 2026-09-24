import assert from "node:assert/strict";
import test from "node:test";
import { getMemoryConfiguration, userMemoryNamespace, verifyMainnetRelayer } from "../src/lib/memory/configuration.ts";

const env = {
  WALRUS_MEMORY_ACCOUNT_ID: `0x${"a".repeat(64)}`,
  WALRUS_MEMORY_DELEGATE_KEY: "b".repeat(64),
};

test("memory config defaults to the hosted relayer and normalizes hex keys", () => {
  const config = getMemoryConfiguration({ ...env, WALRUS_MEMORY_DELEGATE_KEY: ` 0x${env.WALRUS_MEMORY_DELEGATE_KEY} ` });
  assert.equal(config.key, env.WALRUS_MEMORY_DELEGATE_KEY);
  assert.equal(config.serverUrl, "https://relayer.memory.walrus.xyz");
  assert.equal(config.namespace, "zekirlee");
});

test("memory config rejects missing credentials, other networks, and unsafe URLs without leaking secrets", () => {
  for (const override of [
    { WALRUS_NETWORK: "testnet" },
    { WALRUS_MEMORY_ACCOUNT_ID: "" },
    { WALRUS_MEMORY_DELEGATE_KEY: "secret-invalid-key" },
    { WALRUS_MEMORY_SERVER_URL: "http://example.com" },
    { WALRUS_MEMORY_SERVER_URL: "https://user:secret@example.com" },
    { WALRUS_MEMORY_NAMESPACE: "someone:else" },
  ]) {
