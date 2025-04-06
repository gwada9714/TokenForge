import { useEffect, useState, useCallback } from "react";
import { Hash } from "viem";
import { usePublicClient } from "wagmi";

export interface TransactionDetails {
  hash: Hash;
  from: string;
  to: string | null;
  value: string;
  blockNumber: number | null;
  timestamp: number | null;
  status: "pending" | "confirmed" | "failed";
}

export const useTransactionMonitor = (address?: string) => {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const publicClient = usePublicClient();

  const addTransaction = useCallback((tx: TransactionDetails) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.hash === tx.hash);
      if (exists) return prev;
      return [...prev, tx];
    });
  }, []);

  const updateTransaction = useCallback(
    (hash: Hash, updates: Partial<TransactionDetails>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, ...updates } : tx))
      );
    },
    []
  );

  const removeTransaction = useCallback((hash: Hash) => {
    setTransactions((prev) => prev.filter((tx) => tx.hash !== hash));
  }, []);

  const getTransaction = useCallback(
    (hash: Hash) => {
      return transactions.find((tx) => tx.hash === hash);
    },
    [transactions]
  );

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTransactionStatus = async (tx: TransactionDetails) => {
      try {
        const receipt = await publicClient.getTransactionReceipt({
          hash: tx.hash,
        });
        const blockNumber = receipt.blockNumber
          ? Number(receipt.blockNumber)
          : null;
        updateTransaction(tx.hash, {
          status: receipt.status ? "confirmed" : "failed",
          blockNumber,
        });
      } catch (error) {
        console.error("Failed to fetch transaction status:", error);
      }
    };

    // Vérifier le statut des transactions en attente
    transactions
      .filter((tx) => tx.status === "pending")
      .forEach(fetchTransactionStatus);
  }, [address, publicClient, transactions, updateTransaction]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    getTransaction,
  };
};

export default useTransactionMonitor;
