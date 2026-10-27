import { memoryIdentity } from "./identity.ts";

export type AccountMemory = { userId: string; generation: string; rotate: () => Promise<void> };
export async function resolveMemoryScope(config: { namespace: string; key: string }, cookie: string | undefined,
  loadAccount: () => Promise<AccountMemory | null>) {
  // Authentication failures must propagate, never silently select guest memory.
  const account = await loadAccount();
  if (account) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(account.userId) || !uuid.test(account.generation)) throw new Error("Invalid account memory identity");
    return { scope: "account" as const, namespace: `${config.namespace}:account:${account.userId}:${account.generation}`,
      existing: true, token: undefined, rotate: account.rotate };
  }
