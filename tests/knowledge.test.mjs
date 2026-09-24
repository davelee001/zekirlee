import assert from "node:assert/strict";
import test from "node:test";
import { filterTopics, parsePins } from "../src/lib/knowledge.ts";
test("knowledge combines search, category, and pinned filters", () => {
  assert.deepEqual(filterTopics("  MOVE ", "Build", true, ["move"]).map(topic => topic.id), ["move"]);
  assert.equal(filterTopics("no-match", "All", false, []).length, 0);
  assert.equal(filterTopics("", "All", false, []).length, 5);
});
test("pins preserve explicit empty selections and discard unknown data", () => {
  assert.deepEqual(parsePins(null), ["sui-basics", "wallet-activity"]);
  assert.deepEqual(parsePins("[]"), []);
  assert.deepEqual(parsePins('["move","move","invalid",7]'), ["move"]);
  assert.deepEqual(parsePins("broken"), ["sui-basics", "wallet-activity"]);
});
