import assert from "node:assert/strict";
import test from "node:test";
import { filterTopics, parsePins } from "../src/lib/knowledge.ts";
test("knowledge combines search, category, and pinned filters", () => {
  assert.deepEqual(filterTopics("  MOVE ", "Build", true, ["move"]).map(topic => topic.id), ["move"]);
  assert.equal(filterTopics("no-match", "All", false, []).length, 0);
  assert.equal(filterTopics("", "All", false, []).length, 5);
});
