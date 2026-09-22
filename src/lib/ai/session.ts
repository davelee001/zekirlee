export type SessionMessage = { role: "user" | "assistant"; text: string };
export const SESSION_KEY = "zekirlee.chat-session.v1";

export function restoreMessages(raw: string | null): SessionMessage[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return value.map(({ role, text }) => ({ role, text }));
  } catch { return []; }
}

