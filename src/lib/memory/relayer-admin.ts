import { createHash, createPrivateKey, createPublicKey, randomUUID, sign } from "node:crypto";

type AdminConfig = { key: string; accountId: string; serverUrl: string };

// The installed SDK has no public stats/forget methods. Follow the relayer's
// documented account-bound Ed25519 signature; never transmit the delegate key.
