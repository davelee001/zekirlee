import assert from "node:assert/strict";

const base = process.env.BACKEND_URL || "http://localhost:3000";

async function chat(messages) {
  const response = await fetch(new URL("/api/chat", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(60000),
  });
  assert.equal(response.status, 200, `Chat returned HTTP ${response.status}`);
  assert.match(response.headers.get("content-type") || "", /application\/x-ndjson/);
  const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
