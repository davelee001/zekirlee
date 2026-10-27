import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env/public";
import type { AccountMemory } from "./scope";

export async function loadAccountMemory(): Promise<AccountMemory | null> {
  if (!isSupabaseConfigured()) return null;
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  if (!user) return null;
  const created = await client.from("memory_spaces").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (created.error) throw created.error;
  const { data, error: readError } = await client.from("memory_spaces").select("generation").eq("user_id", user.id).single();
  if (readError || !data) throw readError || new Error("Memory space unavailable");
  return { userId: user.id, generation: data.generation, async rotate() {
    // Compare-and-swap prevents a simultaneous clear from replacing a newer space.
    const result = await client.from("memory_spaces").update({ generation: randomUUID() })
      .eq("user_id", user.id).eq("generation", data.generation).select("user_id");
    if (result.error || !result.data?.length) throw result.error || new Error("Memory space changed; refresh settings");
  } };
