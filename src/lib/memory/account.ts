import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env/public";
import type { AccountMemory } from "./scope";

export async function loadAccountMemory(): Promise<AccountMemory | null> {
  if (!isSupabaseConfigured()) return null;
  const client = await createClient();
