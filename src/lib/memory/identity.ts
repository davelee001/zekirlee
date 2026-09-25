import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const MEMORY_COOKIE = "zekirlee-memory";

function signature(id: string, key: string) {
  return createHmac("sha256", Buffer.from(key, "hex")).update(`zekirlee-memory-v1:${id}`).digest("hex");
}

// Guest identity is a server-signed bearer cookie, never a client-supplied namespace.
export function memoryIdentity(cookie: string | undefined, key: string) {
