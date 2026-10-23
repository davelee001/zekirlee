import { cookies } from "next/headers";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { createMemoryManagementHandlers } from "@/lib/memory/management";
import { memoryAdminRequest } from "@/lib/memory/relayer-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const handlers = createMemoryManagementHandlers(async request => {
  let config;
  try { config = getMemoryConfiguration(process.env); }
  catch { return { state: "unconfigured" }; }
  const token = (await cookies()).get(MEMORY_COOKIE)?.value;
  const identity = memoryIdentity(token, config.key);
  if (!identity.existing) return { state: "new" };
  const namespace = `${config.namespace}:guest:${identity.id}`;
  const call = async (operation: "stats" | "forget") => {
