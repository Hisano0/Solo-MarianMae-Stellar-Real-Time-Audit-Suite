"use client";

import { useState, useEffect } from "react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AuditRecord } from "@/lib/auditLog";
import { generateSimulatedTransaction } from "@/lib/simulation";

interface AuditLogProps {
  companyAccountId?: string;
}

export default function AuditLog({ companyAccountId = "DEMO-ACC-123" }: AuditLogProps) {
  const { logs: liveLogs, isLive, loading } = useAuditLog(companyAccountId);

  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(true);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Lazy initial state for simulation mode
  const [simulatedLogs, setSimulatedLogs] = useState<AuditRecord[]>(() => [
    generateSimulatedTransaction(companyAccountId, "normal"),
    generateSimulatedTransaction(companyAccountId, "payroll"),
    generateSimulatedTransaction(companyAccountId, "normal"),
  ]);

  // Prevent Next.js hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Automated transaction streamer when Auto-Stream is toggled
  useEffect(() => {
    if (!autoSimulate || !isSimulationMode) return;

    const interval = setInterval(() => {
      const isFraud = Math.random() < 0.25;
      const newTx = generateSimulatedTransaction(
        companyAccountId,
        isFraud ? "fraud" : "normal"
      );
      setSimulatedLogs((prev) => [newTx, ...prev]);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoSimulate, isSimulationMode, companyAccountId]);

  const triggerManualTx = (type: "normal" | "payroll" | "fraud") => {
    const newTx = generateSimulatedTransaction(companyAccountId, type);
    setSimulatedLogs((prev) => [newTx, ...prev]);
  };

  // Switch between simulated array and real live logs safely
  const activeLogs = (isSimulationMode ? simulatedLogs : liveLogs) ?? [];

  // Safe search filtering
  const filteredLogs = activeLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const txHash = log.txHash?.toLowerCase() ?? "";
    const from = log.from?.toLowerCase() ?? "";
    const to = log.to?.toLowerCase() ?? "";
    const category = log.category?.toLowerCase() ?? "";

    return (
      txHash.includes(query) ||
      from.includes(query) ||
      to.includes(query) ||
      category.includes(query)
    );
  });

  const totalAudited = activeLogs.length;
  const flaggedCount = activeLogs.filter((l) => l.flagged).length;
  const totalVolume = activeLogs
    .reduce((sum, l) => sum + parseFloat(l.amount || "0"), 0)
    .toFixed(2);

  const exportCSV = () => {
    const headers = ["ID,TxHash,From,To,Amount,Asset,Category,Flagged,Reason,CreatedAt\n"];
    const rows = activeLogs.map(
      (l) =>
        `${l.id},${l.txHash || ""},${l.from || ""},${l.to || ""},${l.amount || "0"},${l.asset || ""},${l.category || "N/A"},${l.flagged ? "YES" : "NO"},"${l.flagReason || ""}",${l.createdAt}`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-100 p-4">
      {/* Simulation & Stream Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Audit Engine Mode</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {isSimulationMode ? "Interactive Simulation" : "Stellar Horizon Stream"}
            </span>
            {!isSimulationMode && (
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isLive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {isLive ? "● LIVE SSE" : "CONNECTING..."}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle between live blockchain transactions and continuous audit simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Switch to {isSimulationMode ? "Live Horizon" : "Simulation Mode"}
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      {isSimulationMode && (
        <div className="p-5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-indigo-200">Simulate Corporate Ledger Events</h3>
            <p className="text-xs text-indigo-400">Trigger immediate payment events to observe auditor alerts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerManualTx("normal")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded border border-slate-700"
            >
              + Vendor Invoice
            </button>
            <button
              onClick={() => triggerManualTx("payroll")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded border border-slate-700"
            >
              + Payroll Batch
            </button>
            <button
              onClick={() => triggerManualTx("fraud")}
              className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-xs font-bold text-rose-200 rounded border border-rose-500/40 animate-pulse"
            >
              ⚡ Trigger Fraud Anomaly
            </button>
            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                autoSimulate
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {autoSimulate ? "Stop Stream" : "Auto-Stream Transactions"}
            </button>
          </div>
        </div>
      )}

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400">Total Transactions Audited</p>
          <p className="text-2xl font-bold text-white mt-1">{totalAudited}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400">Audited Volume</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">${totalVolume}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400">Flagged Fraud Alerts</p>
          <p className={`text-2xl font-bold mt-1 ${flaggedCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {flaggedCount}
          </p>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="p-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by hash, account, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          />

          <button
            onClick={exportCSV}
            disabled={activeLogs.length === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium rounded-lg border border-slate-700"
          >
            Export Audit Report (CSV)
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {loading && !isSimulationMode ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Connecting to Stellar Horizon stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No transactions recorded in log.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const toAddress = log.to ?? "";
                  const formattedTo =
                    toAddress.length > 10
                      ? `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`
                      : toAddress || "N/A";

                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        log.flagged ? "bg-rose-950/20 hover:bg-rose-900/30" : "hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {isMounted && log.createdAt
                          ? new Date(log.createdAt).toLocaleTimeString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-300">
                        {log.category || "Transfer"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {formattedTo}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-right text-slate-100 whitespace-nowrap">
                        {parseFloat(log.amount || "0").toFixed(2)} {log.asset || ""}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {log.flagged ? (
                          <span
                            title={log.flagReason}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-help"
                          >
                            ⚠️ FLAGGED ANOMALY
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ✓ AUDITED & VERIFIED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}