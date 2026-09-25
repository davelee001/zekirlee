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
