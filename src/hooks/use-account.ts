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
