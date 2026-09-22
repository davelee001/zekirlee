import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { getAIConfiguration } from "./configuration";

export function getLanguageModel() {
  const { provider, apiKey } = getAIConfiguration(process.env);
  if (provider === "openai") {
    return createOpenAI({ apiKey })(process.env.OPENAI_MODEL || "gpt-4.1-mini");
  }
  return createGoogleGenerativeAI({ apiKey })(process.env.GOOGLE_GENERATIVE_AI_MODEL || "gemini-2.5-flash");
}
