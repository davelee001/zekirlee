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

