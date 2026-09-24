import { z } from "zod";

export class MemoryConfigurationError extends Error {}

export function getMemoryConfiguration(env: Record<string, string | undefined>) {
  if ((env.WALRUS_NETWORK?.trim() || "mainnet") !== "mainnet") {
    throw new MemoryConfigurationError("WALRUS_NETWORK must be mainnet.");
  }
