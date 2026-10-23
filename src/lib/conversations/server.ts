import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createConversationHandler, type ConversationSummary, type SavedConversation } from "./handler";

export const handleConversation = createConversationHandler(async () => {
  if (!isSupabaseConfigured()) return { state: "unconfigured" };
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  if (!user) return { state: "guest" };
  // Every query is bound to the verified user; database RLS independently enforces ownership.
  return { state: "authenticated", store: {
    async list(page) {
      const { data, error } = await supabase.from("conversations").select("id,title,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).order("id", { ascending: false }).range(page * 20, page * 20 + 20);
      if (error) throw error;
      return { conversations: (data ?? []).slice(0, 20) as ConversationSummary[], hasMore: (data?.length ?? 0) > 20 };
    },
    async create(messages) {
      const title = (messages.find(message => message.role === "user")?.text || "Saved conversation").slice(0, 80);
      const { data, error } = await supabase.from("conversations").insert({ user_id: user.id, title, messages })
        .select("id,title,created_at").single();
      if (error) throw error;
      return data as ConversationSummary;
    },
    async get(id) {
      const { data, error } = await supabase.from("conversations").select("id,title,messages,created_at")
        .eq("user_id", user.id).eq("id", id).maybeSingle();
      if (error) throw error;
      return data as SavedConversation | null;
    },
    async remove(id) {
      const { data, error } = await supabase.from("conversations").delete().eq("user_id", user.id).eq("id", id).select("id");
      if (error) throw error;
      return Boolean(data?.length);
    },
  } };
});
