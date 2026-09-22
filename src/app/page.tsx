"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, CircleHelp, Command, Copy, Database, FileText, Gem, History, LayoutGrid, Menu, Network, Plus, Search, Send, Settings2, Sparkles, Wallet, X, Zap } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

const starterPrompts = ["Explain my Sui portfolio", "Find the latest DeFi activity", "What can I build on Sui?"];
const navItems = [{ label: "Overview", icon: LayoutGrid }, { label: "Conversations", icon: History, active: true }, { label: "Knowledge", icon: Database }];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    setMessages((current) => [...current, { role: "user", text: cleanPrompt }, { role: "assistant", text: "I can help with that. Connect your wallet to ground this answer in your on-chain context, or keep exploring with the public Sui knowledge base." }]);
    setPrompt("");
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
          <div className="chat-layout"><div className="chat-column"><div className="conversation-header"><div><span className="live-indicator" /><span>New conversation</span></div><button className="subtle-button"><Copy size={15} />Share</button></div><div className={`conversation ${messages.length ? "conversation-active" : ""}`}>{messages.length === 0 ? <div className="empty-state"><div className="spark-icon"><Sparkles size={22} /></div><h2>Where should we start?</h2><p>Ask anything about Sui, or choose a prompt to open a thread.</p><div className="prompt-list">{starterPrompts.map((item) => <button className="prompt-chip" key={item} onClick={() => setPrompt(item)}>{item}<ArrowUpRight size={14} /></button>)}</div></div> : <div className="message-list">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="message-avatar">{message.role === "user" ? "Z" : <Network size={15} />}</span><div><small>{message.role === "user" ? "You" : "ZekirLee"}</small><p>{message.text}</p></div></div>)}</div>}</div><form className="composer" onSubmit={submitPrompt}><textarea aria-label="Message ZekirLee" placeholder="Ask ZekirLee anything..." value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><div className="composer-footer"><span><Command size={13} />K to search <span className="composer-divider" />Shift + Enter for new line</span><button className="send-button" type="submit" aria-label="Send message"><Send size={17} /></button></div></form></div>
            <aside className="context-panel"><div className="context-heading"><span>Context</span><button className="tiny-button" aria-label="Context settings"><Settings2 size={15} /></button></div><div className="connect-card"><div className="connect-card-icon"><Wallet size={19} /></div><strong>Connect your wallet</strong><p>Give ZekirLee context on your Sui journey.</p><button className="connect-card-button">Connect wallet <ArrowUpRight size={14} /></button></div><div className="context-section"><p className="context-label">Knowledge sources</p><div className="source-row"><span className="source-icon"><Network size={14} /></span><span><strong>Sui mainnet</strong><small>Live network data</small></span><Check size={15} className="check-icon" /></div><div className="source-row"><span className="source-icon docs"><FileText size={14} /></span><span><strong>Sui documentation</strong><small>Updated 2 days ago</small></span><Check size={15} className="check-icon" /></div></div><div className="context-section"><p className="context-label">Session memory</p><div className="memory-meter"><span style={{ width: "36%" }} /></div><div className="memory-meta"><span>36% used</span><span>Private to you</span></div></div><div className="pro-tip"><Zap size={15} /><span><strong>Pro tip</strong> Ask ZekirLee to compare protocols side by side.</span></div></aside>
          </div>
          <footer className="page-footer"><span>Responses can make mistakes. Verify important details on-chain.</span><span className="footer-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="/api/health">System status <span className="status-dot" /></a></span></footer>
        </div>
      </section>
    </main>
  );
}

