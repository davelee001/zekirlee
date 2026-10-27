import "server-only";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, verifyMainnetRelayer } from "./configuration";
import { loadAccountMemory } from "./account";
import { resolveMemoryScope } from "./scope";

// Only pass the user ID obtained from a verified Supabase session.
export async function createMemoryClient(authenticatedUserId: string) {
  const config = getMemoryConfiguration(process.env);
  const account = await loadAccountMemory();
  if (!account || account.userId !== authenticatedUserId) throw new Error("Verified account required");
  const { namespace } = await resolveMemoryScope(config, undefined, async () => account);
  // The SDK has no network selector: check the deployment before signed operations.
  await verifyMainnetRelayer(config.serverUrl);
  return MemWal.create({ ...config, namespace });
}
