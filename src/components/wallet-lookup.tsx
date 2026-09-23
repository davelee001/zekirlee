"use client";
import { useState } from "react";
export function WalletLookup() {
  const [address, setAddress] = useState("");
  const valid = /^0x[0-9a-fA-F]{64}$/.test(address.trim());
  return <section className="workspace-card"><h2>Explore a public address</h2><p>Paste a full Sui address to view its activity in Suiscan. You do not need to connect a wallet. This opens an external explorer; ZekirLee does not fetch or store its transactions.</p><label htmlFor="wallet-address">Public Sui address</label><input id="wallet-address" value={address} onChange={event => setAddress(event.target.value)} placeholder="0x…" spellCheck={false} autoComplete="off" aria-describedby="wallet-hint" /><p id="wallet-hint">{address && !valid ? "Enter 0x followed by 64 hexadecimal characters." : "Only a public address is needed. Never enter a recovery phrase or private key."}</p>{valid && <a href={`https://suiscan.xyz/mainnet/account/${encodeURIComponent(address.trim())}`} target="_blank" rel="noopener noreferrer">View activity on Suiscan ↗</a>}</section>;
}
