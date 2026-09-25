import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const MEMORY_COOKIE = "zekirlee-memory";

function signature(id: string, key: string) {
