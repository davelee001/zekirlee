import { z } from "zod";

export class MemoryConfigurationError extends Error {}

export function getMemoryConfiguration(env: Record<string, string | undefined>) {
