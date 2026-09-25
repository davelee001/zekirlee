export type SessionMessage = { role: "user" | "assistant"; text: string };
export const SESSION_KEY = "zekirlee.chat-session.v1";

export function restoreMessages(raw: string | null): SessionMessage[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 40) return [];
    if (!value.every(item => item && (item.role === "user" || item.role === "assistant") && typeof item.text === "string" && item.text.trim() && item.text.length <= 32000)) return [];
    return value.map(({ role, text }) => ({ role, text }));
  } catch { return []; }
}

export function serializeChatRequest(messages: SessionMessage[], useMemory = false) {
  if (messages.length > 40) throw new Error("This conversation is full. Start a new conversation to keep chatting.");
  const body = JSON.stringify({ messages });
  if (body.length > 64000) throw new Error("This conversation is too long. Start a new conversation to keep chatting.");
  return body;
}
