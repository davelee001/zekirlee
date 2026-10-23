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
