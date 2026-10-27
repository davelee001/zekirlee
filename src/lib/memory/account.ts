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
