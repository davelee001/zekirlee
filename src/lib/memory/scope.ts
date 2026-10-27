import { memoryIdentity } from "./identity.ts";

export type AccountMemory = { userId: string; generation: string; rotate: () => Promise<void> };
export async function resolveMemoryScope(config: { namespace: string; key: string }, cookie: string | undefined,
