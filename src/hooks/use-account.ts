"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env/public";
import { SESSION_KEY } from "@/lib/ai/session";

export const SIGNED_OUT_EVENT = "zekirlee:signed-out";
export const SIGNED_OUT_KEY = "zekirlee.signed-out.v1";
type Account = { state: "loading" | "disabled" | "guest" | "signed-in" | "unavailable"; user: { id: string; email?: string } | null };

export function useAccount() {
  const configured = isSupabaseConfigured();
  const [account, setAccount] = useState<Account>({ state: configured ? "loading" : "disabled", user: null });
  useEffect(() => {
    if (!configured) return;
    const client = createClient();
    let active = true;
    let revision = 0;
    let hadUser = false;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      revision++;
      setAccount({ state: session?.user ? "signed-in" : "guest", user: session?.user ?? null });
      const clearHistory = event === "SIGNED_OUT" && hadUser;
      hadUser = Boolean(session?.user);
      if (clearHistory) {
        try { sessionStorage.removeItem(SESSION_KEY); localStorage.setItem(SIGNED_OUT_KEY, crypto.randomUUID()); } catch { /* Clear mounted chat via the event as well. */ }
