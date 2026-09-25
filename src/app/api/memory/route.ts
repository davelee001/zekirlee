import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { MemWal } from "@mysten-incubation/memwal";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai/model";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { extractionInstructions, factsSchema, storeUsefulFacts } from "@/lib/memory/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
const schema = z.object({ consent: z.literal(true), text: z.string().trim().min(1).max(8000) }).strict();
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return json({ error: "Memory requests must come from this site." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Expected JSON." }, 415);
  let body: unknown;
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "Send a message to remember." }, 400);
  try {
    const decoder = new TextDecoder();
    let raw = "", bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 50000) { await reader.cancel(); return json({ error: "Message is too large." }, 413); }
      raw += decoder.decode(value, { stream: true });
    }
