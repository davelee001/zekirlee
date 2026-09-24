import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspacePage } from "@/components/workspace-page";
import { WorkspaceSettings } from "@/components/workspace-settings";
import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { WalletLookup } from "@/components/wallet-lookup";

const titles: Record<string, string> = { overview: "Overview", knowledge: "Knowledge", "sui-basics": "Sui basics", "wallet-activity": "Wallet activity", settings: "Settings", help: "Help center", network: "Sui network" };
export function generateStaticParams() { return Object.keys(titles).map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return { title: titles[section] || "Page not found" };
}
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(titles, section)) notFound();
  return <WorkspacePage title={titles[section]}>
    {section === "overview" && <><p className="workspace-lead">Learn about Sui, explore public activity, and ask follow-up questions in a conversation that remembers your context.</p><div className="workspace-grid"><section className="workspace-card"><h2>Continue your conversation</h2><p>Your current tab keeps the chat across page navigation and refreshes. No wallet is required.</p><Link href="/conversations">Open conversations →</Link></section><section className="workspace-card"><h2>Learn the foundations</h2><p>Start with objects, ownership, Move, and transactions.</p><Link href="/sui-basics">Read Sui basics →</Link></section><section className="workspace-card"><h2>Explore your workspace</h2><p>Find official learning resources or adjust appearance and session history.</p><Link href="/knowledge">Browse knowledge →</Link><br /><Link href="/settings">Open settings →</Link></section></div></>}
    {section === "knowledge" && <KnowledgeBrowser />}
    {section === "sui-basics" && <article className="workspace-card"><h2>What is Sui?</h2><p>Sui is a smart contract platform that uses Move and an object-oriented approach to represent assets and application state.</p><h2>Objects and ownership</h2><p>Assets and state are represented as objects with identifiers. Ownership rules determine which transactions can access or change them.</p><h2>Move and transactions</h2><p>Developers write Move modules to define application behavior. Transactions invoke that behavior and can update or transfer objects.</p><h2>Where to go next</h2><ul><li><a href="https://docs.sui.io/" target="_blank" rel="noopener noreferrer">Official Sui documentation</a></li><li><a href="https://docs.sui.io/develop/write-move/sui-move-concepts" target="_blank" rel="noopener noreferrer">Sui Move concepts</a></li><li><Link href="/conversations">Ask ZekirLee to explain a concept</Link></li></ul></article>}
    {section === "wallet-activity" && <><p className="workspace-lead">Inspect public activity without connecting or signing anything.</p><WalletLookup /><section className="workspace-card"><h2>What to look for</h2><p>Check the network, transaction status, sender, recipient, and affected objects in the explorer. The chatbot cannot see these details unless you share the relevant public information in your conversation.</p></section></>}
    {section === "settings" && <WorkspaceSettings />}
    {section === "help" && <div className="workspace-grid"><section className="workspace-card"><h2>Send a message</h2><p>Open Conversations, type a question, and press Enter or click send. Shift + Enter adds a new line. Replies appear progressively above the input.</p><Link href="/conversations">Start chatting →</Link></section><section className="workspace-card"><h2>Keep context</h2><p>Continue asking questions in the same conversation. History remains in the current tab on refresh. Use New conversation to reset it. At the session limit, start a new conversation.</p></section><section className="workspace-card"><h2>When a reply fails</h2><p>Retry after a connection or provider interruption. A setup error means the site operator needs to configure its AI provider. A wallet connection is never required for chat.</p></section><section className="workspace-card"><h2>Personalize the workspace</h2><p>Use Settings to change the theme or clear saved tab history.</p><Link href="/settings">Open settings →</Link></section></div>}
    {section === "network" && <><p className="workspace-lead">Resources for exploring Sui Mainnet.</p><section className="workspace-card"><h2>Explore the network</h2><p>This workspace does not monitor live network health. Open the explorer to inspect current blocks, transactions, and public accounts.</p><a href="https://suiscan.xyz/mainnet/home" target="_blank" rel="noopener noreferrer">Open Suiscan Mainnet ↗</a><br /><Link href="/wallet-activity">Look up a public address →</Link></section></>}
  </WorkspacePage>;
}
