import assert from "node:assert/strict";

const base = process.env.BACKEND_URL || "http://localhost:3000";

async function chat(messages) {
