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
    body = JSON.parse(raw + decoder.decode());
  } catch { return json({ error: "Invalid memory request." }, 400); }
  finally { reader.releaseLock(); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Enable memory and send up to 8,000 characters." }, 400);

  let config;
  try { config = getMemoryConfiguration(process.env); }
  catch { return json({ error: "Memory storage is not configured yet. Your chat still works." }, 503); }
  const identity = memoryIdentity(request.cookies.get(MEMORY_COOKIE)?.value, config.key);
  const setIdentity = (response: NextResponse) => {
    response.cookies.set(MEMORY_COOKIE, identity.token, {
      httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  };
  // Establish the cookie before any writes, including requests that later time out.
  if (!identity.existing) return setIdentity(json({ code: "MEMORY_SESSION_CREATED" }, 409));
  const namespace = `${config.namespace}:guest:${identity.id}`;
  let response: NextResponse;
  try {
    await verifyMainnetRelayer(config.serverUrl);
    const writer = MemWal.create({ ...config, namespace });
    const outcome = await storeUsefulFacts({
      text: parsed.data.text, namespace, writer,
      extract: async text => {
        const result = await generateText({
          model: getLanguageModel(), system: extractionInstructions,
          prompt: JSON.stringify({ userMessage: text }),
          output: Output.object({ schema: factsSchema }),
          maxOutputTokens: 1000, maxRetries: 0,
          abortSignal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)]),
