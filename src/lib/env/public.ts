import { z } from "zod";
export function getSupabaseConfig() {
  return z.object({
    url: z.url(),
    publishableKey: z.string().min(1, "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  }).parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

