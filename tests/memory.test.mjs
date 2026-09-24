import assert from "node:assert/strict";
import test from "node:test";
import { getMemoryConfiguration, userMemoryNamespace, verifyMainnetRelayer } from "../src/lib/memory/configuration.ts";

const env = {
  WALRUS_MEMORY_ACCOUNT_ID: `0x${"a".repeat(64)}`,
  WALRUS_MEMORY_DELEGATE_KEY: "b".repeat(64),
