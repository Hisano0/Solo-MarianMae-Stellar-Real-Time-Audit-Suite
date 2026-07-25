"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import ConnectWallet from "@/components/ConnectWallet";
import SendPayment from "@/components/SendPayment";
import AuditLog from "@/components/AuditLog";

// Fallback demo account key so Simulation Mode works even if wallet state is initializing
const DEMO_ACCOUNT = "GBRPYHIL2CI3FNM4BXLFMNDLIGTUA2J2R3DRQUUTG4ORBSKX2L7C5THB";

export default function Home() {
  const { accountId, isConnected } = useWallet();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use the connected wallet key if available, otherwise fall back to demo key
  const activeAccount = accountId || DEMO_ACCOUNT;

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 space-y-10">
        <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Stellar Real-Time Audit Suite
            </h1>
            <p className="text-sm text-slate-400 mt-1">Continuous, instant financial monitoring on testnet.</p>
          </div>
          <ConnectWallet />
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 space-y-10">
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Stellar Real-Time Audit Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1">Continuous, instant financial monitoring on testnet.</p>
        </div>
        <ConnectWallet />
      </header>

      <section className="max-w-5xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SendPayment publicKey={activeAccount} onSent={() => console.log("Payment sent!")} />
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Auditor Read-Only Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every transaction submitted through this portal executes on-chain and streams instantly to the live log below via Stellar Horizon SSE streams. Fraud or unapproved disbursements are identified instantly rather than post-quarter.
              </p>
            </div>
            {!isConnected && (
              <p className="text-xs text-amber-400 font-medium mt-4">
                ⚡ Running in Simulation Mode. Connect your wallet above for live testnet streaming.
              </p>
            )}
          </div>
        </div>

        <AuditLog companyAccountId={activeAccount} />
      </section>
    </main>
  );
}
