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
