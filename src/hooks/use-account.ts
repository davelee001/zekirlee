"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env/public";
import { SESSION_KEY } from "@/lib/ai/session";
import { announceMemoryReset } from "@/lib/memory/browser-events";

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
    let previousUser: string | null | undefined;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      revision++;
      const nextUser = session?.user.id ?? null;
      if (previousUser !== undefined && previousUser !== nextUser) announceMemoryReset();
      previousUser = nextUser;
      setAccount({ state: session?.user ? "signed-in" : "guest", user: session?.user ?? null });
      const clearHistory = event === "SIGNED_OUT" && hadUser;
      hadUser = Boolean(session?.user);
      if (clearHistory) {
        try { sessionStorage.removeItem(SESSION_KEY); localStorage.setItem(SIGNED_OUT_KEY, crypto.randomUUID()); } catch { /* Clear mounted chat via the event as well. */ }
        window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
      }
    });
    const initialRevision = revision;
    client.auth.getUser().then(({ data, error }) => {
      if (!active || revision !== initialRevision) return;
      setAccount({ state: data.user ? "signed-in" : error && error.name !== "AuthSessionMissingError" ? "unavailable" : "guest", user: data.user });
    }).catch(() => { if (active && revision === initialRevision) setAccount({ state: "unavailable", user: null }); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [configured]);
  return account;
}
