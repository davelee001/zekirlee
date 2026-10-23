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
