export const knowledgeTopics = [
  { id: "sui-basics", title: "Sui basics", category: "Learn", description: "Start with objects, ownership, Move, and transactions.", href: "/sui-basics" },
  { id: "wallet-activity", title: "Wallet activity", category: "Explore", description: "Look up a public Sui address in a blockchain explorer.", href: "/wallet-activity" },
  { id: "sui-docs", title: "Developer documentation", category: "Build", description: "Official Sui guides for building applications.", href: "https://docs.sui.io/" },
  { id: "move", title: "Move concepts", category: "Build", description: "Understand the language and Sui's object model.", href: "https://docs.sui.io/develop/write-move/sui-move-concepts" },
  { id: "network", title: "Sui network", category: "Explore", description: "Find Mainnet resources and public activity.", href: "/network" },
];

export function filterTopics(query: string, category: string, pinnedOnly: boolean, pins: string[]) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return knowledgeTopics.filter(topic =>
    (category === "All" || topic.category === category) &&
    (!pinnedOnly || pins.includes(topic.id)) &&
    words.every(word => `${topic.title} ${topic.description} ${topic.category}`.toLowerCase().includes(word)),
  );
}

export function parsePins(raw: string | null): string[] {
  const defaults = ["sui-basics", "wallet-activity"];
  if (raw === null) return defaults;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return defaults;
    return value.filter((id): id is string => typeof id === "string" && knowledgeTopics.some(topic => topic.id === id));
  } catch { return defaults; }
}
