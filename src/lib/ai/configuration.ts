export class ChatConfigurationError extends Error {}

export function getAIConfiguration(env: Record<string, string | undefined>) {
  const provider = env.AI_PROVIDER?.trim() || "google";
  if (provider !== "google" && provider !== "openai") {
    throw new ChatConfigurationError("Chat setup is incomplete: set AI_PROVIDER to google or openai in the server environment, then restart the app.");
  }
  const keyName = provider === "google" ? "GOOGLE_GENERATIVE_AI_API_KEY" : "OPENAI_API_KEY";
  const apiKey = env[keyName]?.trim();
  if (!apiKey) {
    throw new ChatConfigurationError(`Chat is not configured yet. Add ${keyName} to .env.local (or your hosting environment) and restart the app. No wallet is required.`);
  }
  return { provider, apiKey };
}
