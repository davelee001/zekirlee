import { streamText } from "ai";
import { getLanguageModel } from "@/lib/ai/model";
import { createChatHandler } from "@/lib/ai/chat-handler";
import { ChatConfigurationError, getAIConfiguration } from "@/lib/ai/configuration";

export const runtime = "nodejs";
export const maxDuration = 60;

// Guest chat deliberately has no wallet, Supabase, or persistent-memory dependency.
export const POST = createChatHandler(async (messages, abortSignal) => {
  const result = streamText({
    model: getLanguageModel(),
    system: "You are ZekirLee, a helpful assistant with knowledge of Sui. Answer general questions directly without requiring a wallet connection. You have no wallet details, live blockchain data, or browsing tools. Do not claim to have inspected a portfolio or fetched current prices or activity. When personal or live data is needed, explain the limitation and ask for relevant public information; never request private keys or seed phrases.",
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
