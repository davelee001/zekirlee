import { z } from "zod";

const messagesSchema = z.array(z.object({
  role: z.enum(["user", "assistant"]), text: z.string().trim().min(1).max(32000),
}).strict().refine(message => message.role === "assistant" || message.text.length <= 8000)).min(1).max(40);
const bodySchema = z.object({ messages: messagesSchema }).strict();
export type SavedMessage = z.infer<typeof messagesSchema>[number];
export type ConversationSummary = { id: string; title: string; created_at: string };
export type SavedConversation = ConversationSummary & { messages: SavedMessage[] };
export type ConversationStore = {
