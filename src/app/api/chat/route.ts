import { streamText } from "ai";
import { getLanguageModel } from "@/lib/ai/model";
import { createChatHandler } from "@/lib/ai/chat-handler";
import { ChatConfigurationError, getAIConfiguration } from "@/lib/ai/configuration";
import { cookies } from "next/headers";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { memoryPrompt, recallForChat } from "@/lib/memory/recall";

export const runtime = "nodejs";
export const maxDuration = 60;

// Memory is optional and failures fall back to the current conversation.
export const POST = createChatHandler(async (messages, abortSignal, context) => {
  const memory = await recallForChat({
    enabled: context.useMemory, query: messages.at(-1)!.text, signal: abortSignal,
    loadClient: async () => {
      if (context.request.headers.get("origin") !== new URL(context.request.url).origin) throw new Error("Memory requires same origin");
      const config = getMemoryConfiguration(process.env);
      const cookie = (await cookies()).get(MEMORY_COOKIE)?.value;
      if (!cookie) return null;
      const identity = memoryIdentity(cookie, config.key);
      if (!identity.existing) return null;
      await verifyMainnetRelayer(config.serverUrl);
      return MemWal.create({ ...config, namespace: `${config.namespace}:guest:${identity.id}` });
    },
  });
  abortSignal.throwIfAborted();
  context.reportMemory(memory.status, memory.facts.length);
  const result = streamText({
    model: getLanguageModel(),
    system: "You are ZekirLee, a helpful assistant with knowledge of Sui. Answer general questions directly without requiring a wallet connection. You have no wallet details, live blockchain data, or browsing tools. Do not claim to have inspected a portfolio or fetched current prices or activity. When personal or live data is needed, explain the limitation and ask for relevant public information; never request private keys or seed phrases." + memoryPrompt(memory.facts),
    messages: messages.map(({ role, text }) => ({ role, content: text })),
    maxOutputTokens: 1500,
    maxRetries: 0,
    abortSignal,
    onError: () => { /* Errors are returned as safe stream events below. */ },
  });
  return (async function* () {
    for await (const part of result.fullStream) {
      if (part.type === "error") throw new Error("Provider stream failed");
      if (part.type === "text-delta") yield part.text;
    }
  })();
}, () => {
  try {
    getAIConfiguration(process.env);
  } catch (error) {
    if (error instanceof ChatConfigurationError) return error.message;
    throw error;
  }
});
