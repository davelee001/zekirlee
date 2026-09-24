"use client";
import Link from "next/link";
import { useState } from "react";
import { Pin } from "lucide-react";
import { filterTopics } from "@/lib/knowledge";
import { usePinnedTopics } from "@/hooks/use-pinned-topics";

export function KnowledgeBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const { pins, toggle } = usePinnedTopics();
  const topics = filterTopics(query, category, pinnedOnly, pins);
  function reset() { setQuery(""); setCategory("All"); setPinnedOnly(false); }
  return <>
    <p className="workspace-lead">Find a topic, open its resources, or pin it to your sidebar for later.</p>
    <section className="workspace-card knowledge-controls" aria-label="Filter knowledge topics">
      <label htmlFor="topic-search">Search topics</label><input id="topic-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Sui, Move, wallets…" />
      <div className="topic-filters" aria-label="Topic categories">{["All", "Learn", "Build", "Explore"].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <label className="pinned-filter"><input type="checkbox" checked={pinnedOnly} onChange={event => setPinnedOnly(event.target.checked)} />Show pinned topics only</label>
      <button onClick={reset}>Clear filters</button>
    </section>
    <p role="status">{topics.length} {topics.length === 1 ? "topic" : "topics"} found. {notice}</p>
    <div className="workspace-grid">{topics.map(topic => <section className="workspace-card" key={topic.id}>
      <p className="context-label">{topic.category}</p><h2>{topic.title}</h2><p>{topic.description}</p>
      <div className="topic-actions">{topic.href.startsWith("/") ? <Link href={topic.href}>Open topic →</Link> : <a href={topic.href} target="_blank" rel="noopener noreferrer">Open official resource ↗</a>}
      <button aria-pressed={pins.includes(topic.id)} aria-label={`${pins.includes(topic.id) ? "Unpin" : "Pin"} ${topic.title}`} onClick={() => { const saved = toggle(topic.id); setNotice(saved ? `${topic.title} ${pins.includes(topic.id) ? "unpinned" : "pinned"}.` : "Updated for this page. Browser storage is unavailable."); }}><Pin size={15} />{pins.includes(topic.id) ? "Pinned" : "Pin"}</button></div>
    </section>)}</div>
    {topics.length === 0 && <section className="workspace-card"><h2>No matching topics</h2><p>Try another search or clear your filters.</p><button onClick={reset}>Show all topics</button></section>}
    <p>These are curated resources. Chat does not automatically retrieve or search their contents.</p>
  </>;
}
