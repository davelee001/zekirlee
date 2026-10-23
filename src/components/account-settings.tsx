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
    finally { setBusy(false); }
  }
  return <section className="workspace-card" id="account">
    <h2>Account</h2><p>Sign in by email to save conversation snapshots and open them on another device. Guest chat stays available without an account.</p>
    {account.state === "disabled" ? <p>Account sign-in is not configured yet. You can continue chatting as a guest.</p>
      : account.state === "loading" ? <p role="status">Checking account...</p>
      : account.user ? <><p>Signed in as {account.user.email || "your account"}.</p><button disabled={busy} onClick={() => void signOut()}>Sign out</button></>
      : <form className="account-form" onSubmit={signIn}>
        <label htmlFor="account-email">Email address</label>
        <input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
        <button type="submit" disabled={busy || !email.trim()}>{busy ? "Sending link..." : "Email me a sign-in link"}</button>
      </form>}
    {notice && <p role="status">{notice}</p>}
    <p>Conversations are saved only when you choose Save to account. Signing out clears the current tab conversation; saved snapshots and Walrus memory are separate. Walrus memory is linked to this browser, not your account, so manage it separately on shared devices.</p>
  </section>;
}
