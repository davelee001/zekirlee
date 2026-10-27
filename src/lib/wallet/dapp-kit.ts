"use client";

import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";

// Imported only by the browser-only wallet controls, never the chat backend.
export const dAppKit = createDAppKit({
  networks: ["mainnet"],
  defaultNetwork: "mainnet",
  autoConnect: false,
  storage: null,
  createClient: network => new SuiGrpcClient({ network, baseUrl: "https://fullnode.mainnet.sui.io:443" }),
});
