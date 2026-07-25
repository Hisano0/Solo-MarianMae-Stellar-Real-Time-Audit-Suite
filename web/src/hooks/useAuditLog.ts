"use client";

import { useState, useEffect } from "react";
import { Horizon, StrKey } from "@stellar/stellar-sdk";
import { HORIZON_URL } from "@/lib/stellar";
import {
  AuditRecord,
  parsePaymentRecord,
  fetchAuditHistory,
  generateSimulatedTransaction,
} from "@/lib/auditLog";

export function useAuditLog(accountId: string) {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const isValidKey =
      Boolean(accountId) &&
      (typeof StrKey?.isValidEd25519PublicKey === "function"
        ? StrKey.isValidEd25519PublicKey(accountId)
        : accountId.startsWith("G") && accountId.length === 56);

    // SIMULATION MODE
    if (!isValidKey) {
      setLoading(false);
      setIsLive(true);

      const initialSimulated = [
        generateSimulatedTransaction(),
        generateSimulatedTransaction(),
        generateSimulatedTransaction(),
      ];
      setLogs(initialSimulated);

      const intervalId = setInterval(() => {
        const nextSim = generateSimulatedTransaction();
        setLogs((prev) => [nextSim, ...prev]);
      }, 6000);

      return () => clearInterval(intervalId);
    }

    // LIVE HORIZON MODE
    let isCancelled = false;
    setLoading(true);

    fetchAuditHistory(accountId)
      .then((initialLogs) => {
        if (!isCancelled) {
          if (initialLogs.length > 0) {
            setLogs(initialLogs);
          } else {
            setLogs([generateSimulatedTransaction()]);
          }
          setLoading(false);
          setIsLive(true); // <--- Sets live status immediately after historical load
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLogs([generateSimulatedTransaction()]);
          setLoading(false);
          setIsLive(true);
        }
      });

    let closeStream: (() => void) | undefined;

    try {
      const server = new Horizon.Server(HORIZON_URL);
      closeStream = server
        .payments()
        .forAccount(accountId)
        .cursor("now")
        .stream({
          onmessage: (record) => {
            if (isCancelled) return;
            try {
              const parsed = parsePaymentRecord(record);
              setLogs((prev) => [parsed, ...prev]);
              setIsLive(true);
            } catch (parseError) {
              console.error("Failed to parse payment record:", parseError);
            }
          },
          onerror: () => {
            if (!isCancelled) {
              setIsLive(false);
            }
          },
        });
    } catch {
      setIsLive(false);
    }

    return () => {
      isCancelled = true;
      if (closeStream) {
        closeStream();
      }
    };
  }, [accountId]);

  return { logs, isLive, loading };
}