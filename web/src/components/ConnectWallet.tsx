"use client";

import React from "react";
import { useWallet } from "@/hooks/useWallet";

export default function ConnectWallet() {
  const { accountId, isConnected, connect, disconnect, loading } = useWallet();

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && accountId) {
    return (
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
        <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {formatAddress(accountId)}
        </span>
        <button
          onClick={disconnect}
          className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 px-2.5 py-1 rounded transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
    >
      {loading ? "Connecting Wallet..." : "Connect Wallet"}
    </button>
  );
}
