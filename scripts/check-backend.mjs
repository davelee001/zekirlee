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
  assert.equal(events.some(event => event.type === "error"), false, "Chat stream failed; check provider configuration and quota.");
  assert.equal(events.at(-1)?.type, "done", "Chat stream did not finish.");
  const text = events.filter(event => event.type === "text").map(event => event.text).join("");
  assert.ok(text.trim(), "Provider returned no text.");
  return text;
}

try {
  const health = await fetch(new URL("/api/health", base), { signal: AbortSignal.timeout(10000) });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
  console.log("PASS: backend health");
