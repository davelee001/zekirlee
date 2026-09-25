type MemoryReader = {
  recall: (options: { query: string; topK: number; maxDistance: number; maxTokens: number }) => Promise<{
    results: { text: string; distance: number }[];
  }>;
};

export type RecallContext = {
  status: "off" | "new" | "empty" | "recalled" | "unavailable";
  facts: string[];
};

export async function recallForChat(options: {
