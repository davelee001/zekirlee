import { createHash, createPrivateKey, createPublicKey, randomUUID, sign } from "node:crypto";

type AdminConfig = { key: string; accountId: string; serverUrl: string };

// The installed SDK has no public stats/forget methods. Follow the relayer's
// documented account-bound Ed25519 signature; never transmit the delegate key.
export async function memoryAdminRequest(config: AdminConfig, operation: "stats" | "forget", namespace: string, fetcher: typeof fetch = fetch) {
  const path = `/api/${operation}`;
  const body = JSON.stringify({ namespace });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const digest = createHash("sha256").update(body).digest("hex");
  const privateKey = createPrivateKey({
    key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(config.key, "hex")]),
    format: "der", type: "pkcs8",
  });
  const publicKey = createPublicKey(privateKey).export({ format: "der", type: "spki" }).subarray(-32).toString("hex");
  const signature = sign(null, Buffer.from(`${timestamp}.POST.${path}.${digest}.${nonce}.${config.accountId}`), privateKey).toString("hex");
  const response = await fetcher(`${config.serverUrl}${path}`, {
    method: "POST", body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", "x-public-key": publicKey, "x-signature": signature,
      "x-timestamp": timestamp, "x-nonce": nonce, "x-account-id": config.accountId },
  });
  if (!response.ok) throw new Error("Memory management request failed");
  const data = await response.json();
  const count = operation === "stats" ? data.memory_count : data.deleted;
  if (data.namespace !== namespace || !Number.isSafeInteger(count) || count < 0) throw new Error("Invalid memory management response");
  return count as number;
}
