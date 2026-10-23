"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useAccount } from "@/hooks/use-account";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const account = useAccount();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("auth");
    // Read the callback result after hydration; no credentials are present in this URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result === "error") setNotice("The sign-in link is invalid or expired. Request a fresh link and open it in the same browser.");
  }, []);
  async function signIn(event: FormEvent) {
