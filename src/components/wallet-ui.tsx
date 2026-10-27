"use client";

import { useState } from "react";
import { DAppKitProvider, useWalletConnection } from "@mysten/dapp-kit-react";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { dAppKit } from "@/lib/wallet/dapp-kit";

function WalletDetails() {
  const connection = useWalletConnection();
  const [notice, setNotice] = useState("");
  const account = connection.account;

  async function copyAddress() {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setNotice("Public address copied.");
    } catch { setNotice("Copy is unavailable. Select and copy the address below."); }
  }

