import { Horizon } from "@stellar/stellar-sdk";
import { HORIZON_URL } from "./stellar";

export interface AuditRecord {
  id: string;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  category?: string;
  flagged: boolean;
  flagReason?: string;
  createdAt: string;
}

export function parsePaymentRecord(record: any): AuditRecord {
  const isPayment = record.type === "payment" || record.type === "path_payment_strict_send";
  const amount = parseFloat(record.amount || "0");
  const isLargeTx = amount > 10000;

  return {
    id: record.id || `tx-${Date.now()}`,
    txHash: record.transaction_hash || "",
    from: record.from || "",
    to: record.to || "",
    amount: record.amount || "0.00",
    asset: record.asset_code || "XLM",
    category: isPayment ? "Payment" : "Contract Interaction",
    flagged: isLargeTx,
    flagReason: isLargeTx ? "High value transaction exceeding threshold limit" : undefined,
    createdAt: record.created_at || new Date().toISOString(),
  };
}

// Generate realistic mock transactions for Simulation Mode
export function generateSimulatedTransaction(): AuditRecord {
  const amounts = ["250.00", "1200.50", "450.00", "15000.00", "890.25"];
  const accounts = [
    "GA2C4B7OI6W5E3X...X9Y",
    "GB73KS82P90LM1M...L1M",
    "GC902LMAP0482KS...P04",
    "GD455KLE8932JSS...R82"
  ];
  const selectedAmount = amounts[Math.floor(Math.random() * amounts.length)];
  const amountNum = parseFloat(selectedAmount);
  const isFlagged = amountNum > 10000;

  return {
    id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    txHash: `sim_tx_${Math.random().toString(36).substring(2, 12)}`,
    from: accounts[Math.floor(Math.random() * accounts.length)],
    to: accounts[Math.floor(Math.random() * accounts.length)],
    amount: selectedAmount,
    asset: "XLM",
    category: "Payment",
    flagged: isFlagged,
    flagReason: isFlagged ? "High value transaction exceeding threshold limit" : undefined,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchAuditHistory(accountId: string): Promise<AuditRecord[]> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const response = await server
      .payments()
      .forAccount(accountId)
      .order("desc")
      .limit(10)
      .call();

    return response.records.map(parsePaymentRecord);
  } catch (error: any) {
    if (
      error?.response?.status === 404 ||
      error?.status === 404 ||
      error?.name === "NotFoundError"
    ) {
      return [];
    }
    console.warn("Could not fetch Stellar audit history:", error?.message || error);
    return [];
  }
}