"use client";

import { useState, useEffect } from "react";

export function useWallet() {
  const [accountId, setAccountId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Sync wallet state from localStorage across components
  const syncWallet = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stellar_account_id") || "";
      setAccountId(saved);
    }
  };

  useEffect(() => {
    syncWallet();
    window.addEventListener("stellar_wallet_change", syncWallet);
    window.addEventListener("storage", syncWallet);
    return () => {
      window.removeEventListener("stellar_wallet_change", syncWallet);
      window.removeEventListener("storage", syncWallet);
    };
  }, []);

  const connect = async () => {
    setLoading(true);
    let pubKey = "";

    try {
      // 1. Try connecting via @stellar/freighter-api dynamically
      try {
        const freighter = (await import("@stellar/freighter-api")) as any;

        if (typeof freighter.requestAccess === "function") {
          const res = await freighter.requestAccess();
          pubKey = typeof res === "string" ? res : res?.address || "";
        } else if (typeof freighter.getAddress === "function") {
          const res = await freighter.getAddress();
          pubKey = typeof res === "string" ? res : res?.address || "";
        } else if (typeof freighter.getPublicKey === "function") {
          pubKey = await freighter.getPublicKey();
        }
      } catch {
        // Fall back to window.freighter if package dynamic import isn't used
      }

      // 2. Try window.freighter directly
      if (!pubKey && typeof window !== "undefined" && (window as any).freighter) {
        try {
          const freighterObj = (window as any).freighter;
          if (typeof freighterObj.requestAccess === "function") {
            const res = await freighterObj.requestAccess();
            pubKey = typeof res === "string" ? res : res?.address || "";
          } else if (typeof freighterObj.getPublicKey === "function") {
            pubKey = await freighterObj.getPublicKey();
          }
        } catch (e) {
          console.warn("Freighter connection rejected or failed:", e);
        }
      }

      // 3. Fallback prompt if no browser extension is present
      if (!pubKey) {
        const input = prompt(
          "No Stellar wallet extension (like Freighter) detected.\nEnter a Stellar Testnet Public Key (starts with G):",
          "GBRPYHIL2CI3FNM4BXLFMNDLIGTUA2J2R3DRQUUTG4ORBSKX2L7C5THB"
        );
        if (input) pubKey = input.trim();
      }

      // Save connected account and notify app components
      if (pubKey) {
        localStorage.setItem("stellar_account_id", pubKey);
        setAccountId(pubKey);
        window.dispatchEvent(new Event("stellar_wallet_change"));
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stellar_account_id");
      setAccountId("");
      window.dispatchEvent(new Event("stellar_wallet_change"));
    }
  };

  return {
    accountId,
    isConnected: Boolean(accountId),
    loading,
    connect,
    disconnect,
  };
}
