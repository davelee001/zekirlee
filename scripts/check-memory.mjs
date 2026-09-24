import nextEnv from "@next/env";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, MemoryConfigurationError, verifyMainnetRelayer } from "../src/lib/memory/configuration.ts";

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  const config = getMemoryConfiguration(process.env);
