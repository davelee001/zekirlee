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
  enabled: boolean;
  query: string;
  signal: AbortSignal;
  loadClient: () => Promise<MemoryReader | null>;
  timeoutMs?: number;
}): Promise<RecallContext> {
  if (!options.enabled) return { status: "off", facts: [] };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = true;
  let onAbort: () => void = () => {};
  try {
    options.signal.throwIfAborted();
    const stopped = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error("Recall timed out")), options.timeoutMs ?? 4000);
      onAbort = () => reject(new Error("Request cancelled"));
      options.signal.addEventListener("abort", onAbort, { once: true });
    });
    return await Promise.race([stopped, (async (): Promise<RecallContext> => {
      const client = await options.loadClient();
      if (!active || options.signal.aborted) return { status: "unavailable", facts: [] };
      if (!client) return { status: "new", facts: [] };
      const result = await client.recall({ query: options.query, topK: 5, maxDistance: 0.7, maxTokens: 600 });
      const facts: string[] = [];
      const seen = new Set<string>();
      let length = 0;
      for (const hit of result.results) {
        if (typeof hit.text !== "string" || !Number.isFinite(hit.distance) || hit.distance >= 0.7 || hit.distance < 0) continue;
        const text = hit.text.trim();
        const normalized = text.toLowerCase().replace(/\s+/g, " ");
        if (!text || text.length > 500 || seen.has(normalized) || length + text.length > 2000) continue;
        facts.push(text);
        seen.add(normalized);
        length += text.length;
        if (facts.length === 5) break;
      }
      return { status: facts.length ? "recalled" : "empty", facts };
    })()]);
  } catch {
    return { status: "unavailable", facts: [] };
  } finally {
    active = false;
    clearTimeout(timer);
    options.signal.removeEventListener("abort", onAbort);
  }
}
