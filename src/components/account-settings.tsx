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
    event.preventDefault();
    if (busy) return;
    setBusy(true); setNotice("");
    try {
      const { error } = await createClient().auth.signInWithOtp({ email: email.trim(), options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: true,
      } });
      if (error) throw error;
      setNotice("Check your email for a sign-in link. Open it in this browser. The link also creates an account if you are new.");
    } catch { setNotice("The sign-in email could not be sent. Check your email address and try again later."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setNotice("");
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      setNotice("Signed out of this browser. Saved account conversations remain in your account.");
    } catch { setNotice("Sign-out failed. Please try again."); }
