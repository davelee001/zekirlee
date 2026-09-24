import { z } from "zod";

export class MemoryConfigurationError extends Error {}

export function getMemoryConfiguration(env: Record<string, string | undefined>) {
  if ((env.WALRUS_NETWORK?.trim() || "mainnet") !== "mainnet") {
    throw new MemoryConfigurationError("WALRUS_NETWORK must be mainnet.");
  }
  const values = {
    key: env.WALRUS_MEMORY_DELEGATE_KEY?.trim().replace(/^0x/i, "") || "",
    accountId: env.WALRUS_MEMORY_ACCOUNT_ID?.trim() || "",
    serverUrl: (env.WALRUS_MEMORY_SERVER_URL?.trim() || "https://relayer.memory.walrus.xyz").replace(/\/+$/, ""),
    namespace: env.WALRUS_MEMORY_NAMESPACE?.trim() || "zekirlee",
  };
  if (!/^[a-fA-F0-9]{64}$/.test(values.key)) {
    throw new MemoryConfigurationError("Set WALRUS_MEMORY_DELEGATE_KEY to the registered 32-byte Ed25519 delegate key in hex.");
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(values.accountId)) {
    throw new MemoryConfigurationError("Set WALRUS_MEMORY_ACCOUNT_ID to the mainnet MemWalAccount object ID (0x plus 64 hex characters).");
  }
  let url: URL;
  try { url = new URL(values.serverUrl); } catch {
    throw new MemoryConfigurationError("WALRUS_MEMORY_SERVER_URL must be an HTTPS URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new MemoryConfigurationError("WALRUS_MEMORY_SERVER_URL must use HTTPS without credentials, query parameters, or a fragment.");
  }
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(values.namespace)) {
    throw new MemoryConfigurationError("WALRUS_MEMORY_NAMESPACE must contain 1–64 letters, numbers, underscores, or hyphens.");
  }
  return values;
}

export function userMemoryNamespace(namespace: string, authenticatedUserId: string) {
  return `${namespace}:${z.uuid().parse(authenticatedUserId)}`;
}
