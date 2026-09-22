"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { restoreMessages, serializeChatRequest, SESSION_KEY, type SessionMessage } from "@/lib/ai/session";
import { ChatMessage } from "@/components/chat-message";
import { ArrowUpRight, Check, ChevronDown, CircleHelp, Database, FileText, Gem, History, LayoutGrid, Menu, Network, Plus, Search, Send, Settings2, Sparkles, Wallet, X, Zap } from "lucide-react";

type Message = SessionMessage;

const starterPrompts = ["Explain how Sui works", "What is DeFi on Sui?", "What can I build on Sui?"];
const navItems = [{ label: "Overview", icon: LayoutGrid }, { label: "Conversations", icon: History, active: true }, { label: "Knowledge", icon: Database }];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const sendingRef = useRef(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Hydrate browser-only session storage after the server-rendered first frame.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(restoreMessages(sessionStorage.getItem(SESSION_KEY)));
    } catch {
      setStorageNotice("Tab storage is unavailable. Your conversation will last until you refresh.");
    }
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady || isSending) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageNotice("Your conversation could not be saved in this tab. Keep this page open to retain it.");
    }
  }, [messages, sessionReady, isSending]);

  function newConversation() {
    if (sendingRef.current) return;
    setMessages([]);
    setPrompt("");
    setChatError(null);
  }

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || sendingRef.current || !sessionReady) return;
    const nextMessages: Message[] = [...messages, { role: "user", text: cleanPrompt }];
    sendingRef.current = true;
    setIsSending(true);
    setChatError(null);
    setMessages(nextMessages);
    setPrompt("");
    let replyText = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: serializeChatRequest(nextMessages),
        signal: AbortSignal.timeout(55000),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Unable to send your message. Please try again.");
      }
      if (!response.body) throw new Error("No reply received. Please try again.");
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let complete = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          let newline;
          while ((newline = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newline);
            buffer = buffer.slice(newline + 1);
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === "error") throw new Error(event.error);
            if (event.type === "done") complete = true;
            if (event.type === "text" && typeof event.text === "string") {
              replyText += event.text;
              setMessages([...nextMessages, { role: "assistant", text: replyText }]);
            }
          }
        }
        if (!complete || !replyText.trim()) throw new Error("The reply was interrupted. Please try again.");
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } catch (error) {
      if (!replyText) {
        setMessages(messages);
        setPrompt(cleanPrompt);
      }
      setChatError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The reply took too long. Please try again.");
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-topline"><a className="brand" href="#top" onClick={() => setMobileNavOpen(false)}><span className="brand-mark"><Network size={18} strokeWidth={2.5} /></span><span>Zekir<span className="brand-highlight">Lee</span></span></a><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button></div>
        <div className="workspace-switcher"><span className="workspace-avatar">Z</span><span><strong>Personal space</strong><small>Free workspace</small></span><ChevronDown size={16} className="muted-icon" /></div>
        <nav className="main-nav" aria-label="Main navigation"><p className="nav-label">Workspace</p>{navItems.map(({ label, icon: Icon, active }) => <a className={`nav-link ${active ? "nav-link-active" : ""}`} href={`#${label.toLowerCase()}`} key={label} onClick={() => setMobileNavOpen(false)}><Icon size={17} />{label}{active && <span className="nav-pulse" />}</a>)}</nav>
        <div className="saved-section"><div className="section-heading"><p className="nav-label">Pinned</p><button className="tiny-button" aria-label="Add pinned item"><Plus size={15} /></button></div><a className="saved-item" href="#sui-basics"><span className="saved-dot lime" />Sui basics</a><a className="saved-item" href="#wallet-activity"><span className="saved-dot coral" />Wallet activity</a></div>
        <div className="sidebar-bottom"><div className="connection-note"><span className="status-dot" />Sui network <strong>online</strong></div><a className="nav-link" href="#settings"><Settings2 size={17} />Settings</a><a className="nav-link" href="/api/health"><CircleHelp size={17} />Help center</a></div>
      </aside>
      {mobileNavOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <section className="main-panel" id="top">
        <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={21} /></button><div className="breadcrumbs"><span>Conversations</span><span className="breadcrumb-slash">/</span><strong>New conversation</strong></div><div className="topbar-actions"><button className="icon-button search-button" aria-label="Search"><Search size={18} /></button><button className="wallet-button"><Wallet size={16} />Connect wallet</button><button className="avatar-button" aria-label="Open profile">Z</button></div></header>
        <div className="content-wrap">
          <div className="hero-row"><div><p className="eyebrow"><span className="eyebrow-line" />ZekirLee intelligence</p><h1>Ask better questions<br /><em>of the chain.</em></h1><p className="hero-copy">Your thoughtful interface to Sui. Explore protocols, understand activity, and turn on-chain data into decisions.</p></div><div className="chain-stamp"><span className="stamp-icon"><Gem size={21} /></span><span><strong>Built for Sui</strong><small>Fast, composable, open</small></span><ArrowUpRight size={17} /></div></div>
          <div className="chat-layout"><div className="chat-column"><div className="conversation-header"><div><span className="live-indicator" /><span>New conversation</span></div><button className="subtle-button" onClick={newConversation} disabled={isSending || !sessionReady || messages.length === 0}><Plus size={15} />New conversation</button></div><div className="chat-surface"><div className={`conversation ${messages.length ? "conversation-active" : ""}`}>{messages.length === 0 ? <div className="empty-state"><div className="spark-icon"><Sparkles size={22} /></div><h2>Where should we start?</h2><p>Ask anything about Sui. No wallet connection needed.</p><div className="prompt-list">{starterPrompts.map((item) => <button className="prompt-chip" key={item} onClick={() => setPrompt(item)}>{item}<ArrowUpRight size={14} /></button>)}</div></div> : <div className="message-list" role="log" aria-live="polite">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="message-avatar">{message.role === "user" ? "Z" : <Network size={15} />}</span><div><small>{message.role === "user" ? "You" : "ZekirLee"}</small>{message.role === "assistant" ? <ChatMessage text={message.text} /> : <p>{message.text}</p>}</div></div>)}</div>}</div>{isSending && <p className="chat-status" role="status">{messages.at(-1)?.role === "assistant" ? "ZekirLee is writing..." : "ZekirLee is thinking..."}</p>}{chatError && <p className="chat-error" role="alert">{chatError}</p>}{storageNotice && <p className="chat-status" role="status">{storageNotice}</p>}<form className="composer" onSubmit={submitPrompt}><div className="composer-input-row"><textarea rows={1} disabled={isSending} maxLength={8000} aria-label="Message ZekirLee" placeholder="Ask ZekirLee anything..." value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button className="send-button" type="submit" disabled={isSending || !prompt.trim()} aria-label="Send message"><Send size={17} /></button></div><div className="composer-footer"><span>Enter to send <span className="composer-divider" />Shift + Enter for new line</span></div></form></div></div>
            <aside className="context-panel"><div className="context-heading"><span>Context</span><button className="tiny-button" aria-label="Context settings"><Settings2 size={15} /></button></div><div className="connect-card"><div className="connect-card-icon"><Wallet size={19} /></div><strong>Wallet connection is optional</strong><p>Chat freely without a wallet. Wallet-specific context is not connected yet.</p><button className="connect-card-button">Connect wallet <ArrowUpRight size={14} /></button></div><div className="context-section"><p className="context-label">Knowledge sources</p><div className="source-row"><span className="source-icon"><Network size={14} /></span><span><strong>Sui mainnet</strong><small>General knowledge</small></span><Check size={15} className="check-icon" /></div><div className="source-row"><span className="source-icon docs"><FileText size={14} /></span><span><strong>Sui documentation</strong><small>No live retrieval</small></span><Check size={15} className="check-icon" /></div></div><div className="context-section"><p className="context-label">Session memory</p><div className="memory-meter"><span style={{ width: "0%" }} /></div><div className="memory-meta"><span>This conversation only</span><span>Not saved</span></div></div><div className="pro-tip"><Zap size={15} /><span><strong>Pro tip</strong> Ask ZekirLee to compare protocols side by side.</span></div></aside>
          </div>
          <footer className="page-footer"><span>Responses can make mistakes. Verify important details on-chain.</span><span className="footer-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="/api/health">System status <span className="status-dot" /></a></span></footer>
        </div>
      </section>
    </main>
  );
}
