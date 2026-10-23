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
