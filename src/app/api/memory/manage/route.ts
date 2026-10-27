import { cookies } from "next/headers";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { createMemoryManagementHandlers } from "@/lib/memory/management";
import { memoryAdminRequest } from "@/lib/memory/relayer-admin";
import { resolveMemoryScope } from "@/lib/memory/scope";
import { loadAccountMemory } from "@/lib/memory/account";

export const runtime = "nodejs";
export const maxDuration = 60;

const handlers = createMemoryManagementHandlers(async request => {
  let config;
  try { config = getMemoryConfiguration(process.env); }
  catch { return { state: "unconfigured" }; }
  const token = (await cookies()).get(MEMORY_COOKIE)?.value;
  const identity = await resolveMemoryScope(config, token, loadAccountMemory);
  if (!identity.existing) return { state: "new" };
  const namespace = identity.namespace;
  const call = async (operation: "stats" | "forget") => {
    await verifyMainnetRelayer(config.serverUrl);
    await MemWal.create({ ...config, namespace }).compatibility();
    return memoryAdminRequest(config, operation, namespace);
  };
  const nextIdentity = memoryIdentity(undefined, config.key);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return {
    state: "known", scope: identity.scope, stats: () => call("stats"),
    forget: async () => {
      const cleared = await call("forget");
      await identity.rotate?.();
      return cleared;
    },
    replacementCookie: identity.scope === "account" ? undefined : `${MEMORY_COOKIE}=${nextIdentity.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
  };
});

export const GET = handlers.GET;
export const DELETE = handlers.DELETE;
