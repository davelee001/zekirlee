import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const MEMORY_COOKIE = "zekirlee-memory";

function signature(id: string, key: string) {
  return createHmac("sha256", Buffer.from(key, "hex")).update(`zekirlee-memory-v1:${id}`).digest("hex");
}

// Guest identity is a server-signed bearer cookie, never a client-supplied namespace.
export function memoryIdentity(cookie: string | undefined, key: string) {
  const parts = (cookie || "").split(".");
  const [id, mac] = parts;
  if (parts.length === 2 && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id || "") && /^[0-9a-f]{64}$/.test(mac || "")) {
    if (timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(signature(id, key), "hex"))) {
      return { id, token: cookie!, existing: true };
    }
  }
  const fresh = randomUUID();
  return { id: fresh, token: `${fresh}.${signature(fresh, key)}`, existing: false };
}
