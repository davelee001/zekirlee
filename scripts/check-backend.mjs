import assert from "node:assert/strict";

const base = process.env.BACKEND_URL || "http://localhost:3000";

async function chat(messages) {
  const response = await fetch(new URL("/api/chat", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
