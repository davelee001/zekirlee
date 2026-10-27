"use client";

import dynamic from "next/dynamic";

const WalletUI = dynamic(() => import("./wallet-ui"), {
  ssr: false,
  loading: () => <button className="wallet-button" disabled>Loading wallet...</button>,
});

export function WalletControls({ compact = false }: { compact?: boolean }) {
  return <WalletUI compact={compact} />;
}
