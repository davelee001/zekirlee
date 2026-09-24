import { z } from "zod";

export class MemoryConfigurationError extends Error {}

export function getMemoryConfiguration(env: Record<string, string | undefined>) {
  if ((env.WALRUS_NETWORK?.trim() || "mainnet") !== "mainnet") {
    throw new MemoryConfigurationError("WALRUS_NETWORK must be mainnet.");
  }
  const values = {
    key: env.WALRUS_MEMORY_DELEGATE_KEY?.trim().replace(/^0x/i, "") || "",
    accountId: env.WALRUS_MEMORY_ACCOUNT_ID?.trim() || "",
