import "server-only";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

export function getLanguageModel() {
  const provider = z.enum(["google", "openai"]).parse(process.env.AI_PROVIDER || "google");
  if (provider === "openai") {
    const apiKey = z.string().min(1, "Set OPENAI_API_KEY").parse(process.env.OPENAI_API_KEY);
    return createOpenAI({ apiKey })(process.env.OPENAI_MODEL || "gpt-4.1-mini");
  }
  const apiKey = z.string().min(1, "Set GOOGLE_GENERATIVE_AI_API_KEY").parse(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  return createGoogleGenerativeAI({ apiKey })(process.env.GOOGLE_GENERATIVE_AI_MODEL || "gemini-2.5-flash");
}

