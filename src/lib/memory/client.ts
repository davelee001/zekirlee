import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, userMemoryNamespace, verifyMainnetRelayer } from "./configuration";

// Only pass the user ID obtained from a verified Supabase session.
export async function createMemoryClient(authenticatedUserId: string) {
  const config = getMemoryConfiguration(process.env);
export function createMemoryClient(authenticatedUserId: string) {
  const userId = z.uuid().parse(authenticatedUserId);
  z.literal("mainnet").parse(process.env.WALRUS_NETWORK || "mainnet");
  const config = z.object({
    key: z.string().regex(/^[a-fA-F0-9]{64}$/),
    accountId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    serverUrl: z.url().startsWith("https://"),
    namespace: z.string().min(1),
  }).parse({
    key: process.env.WALRUS_MEMORY_DELEGATE_KEY,
    accountId: process.env.WALRUS_MEMORY_ACCOUNT_ID,
    serverUrl: process.env.WALRUS_MEMORY_SERVER_URL || "https://relayer.memory.walrus.xyz",
    namespace: (process.env.WALRUS_MEMORY_NAMESPACE || "zekirlee") + ":" + userId,
  });
  // The SDK relayer API has no network selector. Configure the relayer for Mainnet.
  return MemWal.create(config);
}

