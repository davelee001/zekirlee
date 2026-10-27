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

  return <div className="wallet-details">
    <strong>{connection.isConnected ? `Connected to ${connection.wallet.name}` : "Wallet connection is optional"}</strong>
    <p>{connection.isConnecting ? "Approve the connection in your wallet, or cancel to continue as a guest."
      : "Connect to view your public address. Chat and memory work independently of your wallet."}</p>
    <ConnectButton />
    {account && <div key={account.address} className="wallet-address-details">
      <p>Explorer network: Sui Mainnet</p>
      <code className="wallet-address">{account.address}</code>
      <div className="workspace-actions">
