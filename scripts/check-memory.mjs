import nextEnv from "@next/env";
import { MemWal } from "@mysten-incubation/memwal";
import { getMemoryConfiguration, MemoryConfigurationError, verifyMainnetRelayer } from "../src/lib/memory/configuration.ts";

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  const config = getMemoryConfiguration(process.env);
  console.log("PASS: memory environment configuration");
  await verifyMainnetRelayer(config.serverUrl);
  console.log("PASS: relayer reports mainnet");
  const client = MemWal.create({ ...config, namespace: `${config.namespace}:connection-check` });
  // Health is unauthenticated; recall verifies the account and delegate without writing.
  const timeout = setTimeout(() => {
    console.error("Memory connection check timed out.");
    process.exit(1);
  }, 30000);
