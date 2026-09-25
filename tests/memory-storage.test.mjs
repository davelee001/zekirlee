import assert from "node:assert/strict";
import test from "node:test";
import { memoryIdentity } from "../src/lib/memory/identity.ts";
import { storeUsefulFacts } from "../src/lib/memory/storage.ts";

test("signed memory cookies isolate guests and reject tampering or key rotation", () => {
  const key = "a".repeat(64);
  const first = memoryIdentity(undefined, key);
