import { z } from "zod";

const messagesSchema = z.array(z.object({
  role: z.enum(["user", "assistant"]), text: z.string().trim().min(1).max(32000),
}).strict().refine(message => message.role === "assistant" || message.text.length <= 8000)).min(1).max(40);
const bodySchema = z.object({ messages: messagesSchema }).strict();
export type SavedMessage = z.infer<typeof messagesSchema>[number];
export type ConversationSummary = { id: string; title: string; created_at: string };
export type SavedConversation = ConversationSummary & { messages: SavedMessage[] };
export type ConversationStore = {
  list: (page: number) => Promise<{ conversations: ConversationSummary[]; hasMore: boolean }>;
  create: (messages: SavedMessage[]) => Promise<ConversationSummary>;
  get: (id: string) => Promise<SavedConversation | null>;
  remove: (id: string) => Promise<boolean>;
};
type Access = { state: "unconfigured" } | { state: "guest" } | { state: "authenticated"; store: ConversationStore };

export function createConversationHandler(authorize: () => Promise<Access>) {
  const json = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
  return async (request: Request, id?: string) => {
    const method = request.method;
    const origin = request.headers.get("origin");
    const mutates = method !== "GET";
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site"
      || (mutates && origin !== new URL(request.url).origin)) return json({ error: "Use saved conversations on this site." }, 403);
    if (id && !z.uuid().safeParse(id).success) return json({ error: "Invalid conversation." }, 400);
    if (!(["GET", "POST", "DELETE"].includes(method)) || (method === "POST" && id) || (method === "DELETE" && !id)) return json({ error: "Unsupported operation." }, 405);
    try {
      const access = await authorize();
      if (access.state === "unconfigured") return json({ error: "Account storage is not configured. Guest chat still works.", code: "NOT_CONFIGURED" }, 503);
      if (access.state === "guest") return json({ error: "Sign in to use saved conversations." }, 401);
      if (method === "GET") {
        if (id) {
          const conversation = await access.store.get(id);
          return conversation ? json({ conversation }) : json({ error: "Conversation not found." }, 404);
        }
        const page = Number(new URL(request.url).searchParams.get("page") ?? 0);
        if (!Number.isInteger(page) || page < 0 || page > 1000) return json({ error: "Invalid page." }, 400);
        return json(await access.store.list(page));
      }
      if (method === "DELETE") {
        if (request.headers.get("x-zekirlee-confirm") !== "delete-conversation") return json({ error: "Confirm deletion first." }, 400);
        return await access.store.remove(id!) ? json({ deleted: true }) : json({ error: "Conversation not found." }, 404);
      }
      if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Expected JSON." }, 415);
      const reader = request.body?.pipeThrough(new TextDecoderStream()).getReader();
      if (!reader) return json({ error: "Send a conversation to save." }, 400);
      let raw = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += value;
          if (raw.length > 64000) { await reader.cancel(); return json({ error: "Conversation is too long to save." }, 413); }
        }
      } finally { reader.releaseLock(); }
      let body: unknown;
      try { body = JSON.parse(raw); } catch { return json({ error: "Invalid conversation request." }, 400); }
      const parsed = bodySchema.safeParse(body);
      if (!parsed.success) return json({ error: "Save 1–40 user/assistant messages within the chat limits." }, 400);
      return json({ conversation: await access.store.create(parsed.data.messages) }, 201);
    } catch {
      return json({ error: "Saved conversations are unavailable. Your current chat is unchanged; check account storage setup or try again." }, 503);
    }
  };
}
