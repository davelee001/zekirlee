import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().trim().min(1).max(32000),
}).refine(message => message.role === "assistant" || message.text.length <= 8000);
const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
}).refine(({ messages }) => messages.at(-1)?.role === "user");

type ChatMessage = z.infer<typeof messageSchema>;
type Reply = (messages: ChatMessage[], signal: AbortSignal) => Promise<string | AsyncIterable<string>>;

class RequestTooLarge extends Error {}

async function readBody(request: Request) {
  const reader = request.body?.pipeThrough(new TextDecoderStream()).getReader();
  if (!reader) return "";
  let raw = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return raw;
      raw += chunk.value;
      if (raw.length > 64000) {
        await reader.cancel();
        throw new RequestTooLarge();
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function createChatHandler(reply: Reply, configurationError?: () => string | undefined) {
  return async function POST(request: Request) {
    const json = (body: object, status = 200) => Response.json(body, {
      status, headers: { "Cache-Control": "no-store" },
    });
    let body: unknown;
    try {
      const raw = await readBody(request);
      body = JSON.parse(raw);
    } catch (error) {
      if (error instanceof RequestTooLarge) return json({ error: "Please send a shorter conversation." }, 413);
      return json({ error: "Invalid chat request." }, 400);
    }
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return json({ error: "Send a message of up to 8,000 characters." }, 400);
    const setupError = configurationError?.();
    if (setupError) return json({ error: setupError, code: "CHAT_NOT_CONFIGURED" }, 503);

    try {
      const cancellation = new AbortController();
      const signal = AbortSignal.any([request.signal, cancellation.signal, AbortSignal.timeout(45000)]);
      signal.throwIfAborted();
      const result = await reply(parsed.data.messages, signal);
      if (typeof result === "string") {
        if (!result.trim()) throw new Error("Empty model response");
        return json({ text: result });
      }
      const iterator = result[Symbol.asyncIterator]();
      const encoder = new TextEncoder();
      let hasText = false;
      let cancelled = false;
      const stream = new ReadableStream({
        async pull(controller) {
          const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          try {
            const chunk = await iterator.next();
            if (cancelled) return;
            if (chunk.done) {
              if (!hasText) throw new Error("Empty model response");
              send({ type: "done" });
              controller.close();
            } else {
              hasText ||= Boolean(chunk.value.trim());
              send({ type: "text", text: chunk.value });
            }
          } catch {
            if (cancelled) return;
            cancellation.abort();
            send({ type: "error", error: "The reply was interrupted. Please try again." });
            controller.close();
          }
        },
        async cancel() {
          cancelled = true;
          cancellation.abort();
          try { await iterator.return?.(); } catch { /* The provider may reject on abort. */ }
        },
        async cancel() { await iterator.return?.(); },
      });
      return new Response(stream, { headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      } });
    } catch {
      // Never expose provider errors or credentials in the browser.
      return json({ error: "ZekirLee could not reply right now. Please try again shortly." }, 503);
    }
  };
}
