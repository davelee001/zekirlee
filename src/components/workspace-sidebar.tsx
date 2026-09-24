"use client";
import Link from "next/link";
import { knowledgeTopics } from "@/lib/knowledge";
import { usePinnedTopics } from "@/hooks/use-pinned-topics";
import { usePathname } from "next/navigation";
import { CircleHelp, Database, History, LayoutGrid, Network, Plus, Settings2, X } from "lucide-react";

const links = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/conversations", label: "Conversations", icon: History },
  { href: "/knowledge", label: "Knowledge", icon: Database },
];
export function WorkspaceSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { pins } = usePinnedTopics();
  const active = (href: string) => pathname === href || (href === "/conversations" && pathname === "/");
  return <>
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-topline"><Link className="brand" href="/overview" onClick={onClose}><span className="brand-mark"><Network size={18} /></span>ZekirLee</Link><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={18} /></button></div>
      <div className="workspace-switcher"><span className="workspace-avatar">Z</span><span><strong>Personal space</strong><small>Your learning workspace</small></span></div>
      <nav className="main-nav" aria-label="Workspace navigation"><p className="nav-label">Workspace</p>{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href} onClick={onClose} aria-current={active(href) ? "page" : undefined} className={`nav-link ${active(href) ? "nav-link-active" : ""}`}><Icon size={17} />{label}{active(href) && <span className="nav-pulse" />}</Link>)}</nav>
      <div className="saved-section"><div className="section-heading"><p className="nav-label">Pinned</p><Link href="/knowledge" className="tiny-button" aria-label="Browse knowledge topics" onClick={onClose}><Plus size={15} /></Link></div>{knowledgeTopics.filter(topic => pins.includes(topic.id)).map(topic => topic.href.startsWith("/") ? <Link key={topic.id} href={topic.href} onClick={onClose} aria-current={active(topic.href) ? "page" : undefined} className={`saved-item ${active(topic.href) ? "nav-link-active" : ""}`}><span className="saved-dot lime" />{topic.title}</Link> : <a key={topic.id} href={topic.href} className="saved-item" target="_blank" rel="noopener noreferrer" onClick={onClose}><span className="saved-dot lime" />{topic.title} ?</a>)}{pins.length === 0 && <p className="pins-empty">Pin topics from Knowledge to see them here.</p>}</div>
      <div className="sidebar-bottom"><Link className="connection-note" href="/network" onClick={onClose}><Network size={14} />Sui network <strong>Explore</strong></Link><Link className={`nav-link ${active("/settings") ? "nav-link-active" : ""}`} aria-current={active("/settings") ? "page" : undefined} href="/settings" onClick={onClose}><Settings2 size={17} />Settings</Link><Link className={`nav-link ${active("/help") ? "nav-link-active" : ""}`} href="/help" onClick={onClose}><CircleHelp size={17} />Help center</Link></div>
    </aside>
    {open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}
  </>;
}
