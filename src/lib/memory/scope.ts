import { memoryIdentity } from "./identity.ts";

export type AccountMemory = { userId: string; generation: string; rotate: () => Promise<void> };
export async function resolveMemoryScope(config: { namespace: string; key: string }, cookie: string | undefined,
  loadAccount: () => Promise<AccountMemory | null>) {
  // Authentication failures must propagate, never silently select guest memory.
  const account = await loadAccount();
  if (account) {
