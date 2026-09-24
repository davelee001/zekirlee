import nextEnv from "@next/env";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, MemoryConfigurationError, verifyMainnetRelayer } from "../src/lib/memory/configuration.ts";

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  const config = getMemoryConfiguration(process.env);
  console.log("PASS: memory environment configuration");
  await verifyMainnetRelayer(config.serverUrl);
  console.log("PASS: relayer reports mainnet");
