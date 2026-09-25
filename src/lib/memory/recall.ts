type MemoryReader = {
  recall: (options: { query: string; topK: number; maxDistance: number; maxTokens: number }) => Promise<{
    results: { text: string; distance: number }[];
  }>;
};

