"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SIGNED_OUT_EVENT, useAccount } from "@/hooks/use-account";
import { restoreMessages, SESSION_KEY } from "@/lib/ai/session";
import type { ConversationSummary } from "@/lib/conversations/handler";

export function ConversationLibrary() {
  const account = useAccount();
  const [listing, setListing] = useState<{ owner: string; rows: ConversationSummary[]; hasMore: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; action: "open" | "delete" } | null>(null);
  const userId = account.user?.id;
  const operation = useRef({ generation: 0, controller: null as AbortController | null });

  useEffect(() => {
    const current = operation.current;
    const cancel = () => { current.generation++; current.controller?.abort(); };
    const signedOut = () => { cancel(); setConfirm(null); setBusy(false); };
    window.addEventListener(SIGNED_OUT_EVENT, signedOut);
    return () => { cancel(); window.removeEventListener(SIGNED_OUT_EVENT, signedOut); };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch(`/api/conversations?page=${page}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Saved conversations are unavailable.");
      if (!controller.signal.aborted) { setListing({ owner: userId, rows: result.conversations, hasMore: result.hasMore }); setNotice(""); setBusy(false); }
    }).catch(error => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [userId, page, revision]);

  async function perform() {
    if (!confirm || busy || !userId) return;
    const generation = operation.current.generation;
    const controller = new AbortController();
    operation.current.controller = controller;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/conversations/${confirm.id}`, {
        method: confirm.action === "delete" ? "DELETE" : "GET",
        headers: confirm.action === "delete" ? { "X-Zekirlee-Confirm": "delete-conversation" } : {},
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]), cache: "no-store",
      });
      const result = await response.json();
      if (generation !== operation.current.generation) return;
      if (!response.ok) throw new Error(result.error || "Conversation request failed.");
      if (confirm.action === "open") {
        const messages = restoreMessages(JSON.stringify(result.conversation.messages));
        if (!messages.length) throw new Error("This snapshot contains no usable messages.");
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
        // Remount chat so a cached page cannot keep the conversation this snapshot replaces.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/");
      } else {
        setListing(null); setPage(0); setRevision(value => value + 1);
        setNotice("Snapshot deleted. Current tab history and Walrus memory are unchanged.");
      }
    } catch (error) {
      if (generation === operation.current.generation) setNotice(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The request timed out. Refresh before retrying.");
    } finally {
      if (generation === operation.current.generation) { setBusy(false); setConfirm(null); }
    }
  }

  if (account.state === "loading") return <p role="status">Checking account...</p>;
  if (!userId) return <section className="workspace-card"><h2>Saved conversations</h2><p>{account.state === "disabled" ? "Account storage is not configured yet." : "Sign in to see your saved conversations."} Guest chat remains available.</p><Link href="/settings#account">Account settings</Link><br /><Link href="/">Continue chatting</Link></section>;
  const current = listing?.owner === userId ? listing : null;
  return <section className="workspace-card">
    <h2>Your saved snapshots</h2><p>Save from the chat page to keep a snapshot in your account. Opening one replaces this tab&apos;s current conversation. It does not overwrite the saved snapshot.</p>
    <div className="workspace-actions"><button disabled={busy} onClick={() => { setListing(null); setPage(0); setRevision(value => value + 1); }}>Refresh</button><Link href="/">Open chat</Link></div>
    {notice && <p role="status">{notice}</p>}
    {!current ? <p>{notice ? "Use Refresh to try again." : "Loading saved conversations..."}</p> : current.rows.length === 0 ? <p>No saved conversations on this page.</p> : <ul className="saved-conversations">{current.rows.map(row => <li key={row.id}>
      <strong>{row.title}</strong><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
      <div className="workspace-actions"><button disabled={busy} onClick={() => setConfirm({ id: row.id, action: "open" })}>Open</button><button disabled={busy} onClick={() => setConfirm({ id: row.id, action: "delete" })}>Delete</button></div>
    </li>)}</ul>}
    {confirm && <div role="group" aria-label="Confirm conversation action"><p>{confirm.action === "open" ? "Replace the current tab conversation with this snapshot? Unsaved tab messages will be replaced." : "Delete this account snapshot? This cannot be undone."}</p><div className="workspace-actions"><button disabled={busy} onClick={() => void perform()}>Confirm {confirm.action}</button><button disabled={busy} onClick={() => setConfirm(null)}>Cancel</button></div></div>}
    <div className="workspace-actions"><button disabled={busy || page === 0} onClick={() => { setListing(null); setPage(value => value - 1); }}>Previous</button><span>Page {page + 1}</span><button disabled={busy || !current?.hasMore} onClick={() => { setListing(null); setPage(value => value + 1); }}>Next</button></div>
  </section>;
}
