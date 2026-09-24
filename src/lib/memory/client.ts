import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, userMemoryNamespace, verifyMainnetRelayer } from "./configuration";

// Only pass the user ID obtained from a verified Supabase session.
export async function createMemoryClient(authenticatedUserId: string) {
  const config = getMemoryConfiguration(process.env);
  const namespace = userMemoryNamespace(config.namespace, authenticatedUserId);
  // The SDK has no network selector: check the deployment before signed operations.
  await verifyMainnetRelayer(config.serverUrl);
  return MemWal.create({ ...config, namespace });
  }).parse({
    key: process.env.WALRUS_MEMORY_DELEGATE_KEY,
    accountId: process.env.WALRUS_MEMORY_ACCOUNT_ID,
    serverUrl: process.env.WALRUS_MEMORY_SERVER_URL || "https://relayer.memory.walrus.xyz",
    namespace: (process.env.WALRUS_MEMORY_NAMESPACE || "zekirlee") + ":" + userId,
  });
  // The SDK relayer API has no network selector. Configure the relayer for Mainnet.
  return MemWal.create(config);
}

