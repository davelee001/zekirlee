"use client";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { SESSION_KEY } from "@/lib/ai/session";
export function WorkspaceSettings() {
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  function clear() {
    try { sessionStorage.removeItem(SESSION_KEY); setNotice("Conversation history cleared for this tab."); }
    catch { setNotice("Browser storage is unavailable. Return to chat and use New conversation."); }
    setConfirm(false);
  }
  return <div className="workspace-grid">
    <section className="workspace-card"><h2>Appearance</h2><p>Switch between light and dark. Your preference is remembered in this browser.</p><ThemeToggle /></section>
    <section className="workspace-card"><h2>Conversation history</h2><p>Messages stay in this tab across refreshes. Clearing history starts a fresh chat and cannot be undone.</p>{confirm ? <div className="workspace-actions"><button onClick={clear}>Clear history</button><button onClick={() => setConfirm(false)}>Cancel</button></div> : <button onClick={() => setConfirm(true)}>Clear this tab&apos;s history</button>}<p role="status">{notice}</p></section>
    <section className="workspace-card"><h2>Privacy and connections</h2><p>Chat does not require a wallet or account. Messages are sent to the configured AI provider to generate replies. No wallet transactions are signed, and no memories are written to Walrus by this chat.</p></section>
  </div>;
}
