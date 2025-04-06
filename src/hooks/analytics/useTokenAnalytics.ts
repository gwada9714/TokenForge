import { useEffect, useState } from "react";
import { TokenContract } from "@/providers/contract/ContractProvider";
import { TokenMetrics } from "@/types/analytics";

export interface TransactionData {
  date: string;
  volume: string;
  count: number;
  transactionTypes: {
    buy: number;
    sell: number;
    transfer: number;
  };
}

export interface TokenAnalytics {
  loading: boolean;
  tokenMetrics: TokenMetrics | null;
  dailyTransactions: TransactionData[];
  weeklyTransactions: TransactionData[];
  monthlyTransactions: TransactionData[];
}

export const useTokenAnalytics = (token?: TokenContract): TokenAnalytics => {
  const [analytics, setAnalytics] = useState<TokenAnalytics>({
    loading: true,
    tokenMetrics: null,
    dailyTransactions: [],
    weeklyTransactions: [],
    monthlyTransactions: [],
  });

  useEffect(() => {
    if (!token) {
      setAnalytics((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setAnalytics((prev) => ({ ...prev, loading: true }));

        const tokenMetrics: TokenMetrics = {
          address: token.address || null,
          chainId: Number(token.chainId),
          name: token.name || null,
          symbol: token.symbol || null,
          decimals: token.decimals,
          totalSupply: token.totalSupply?.toString() || "0",
          holders: 1000, // Mock data
          transactions: {
            total: 5000,
            buy: 2000,
            sell: 1500,
            transfer: 1500,
          },
          volume: "10000000000000000000000",
        };

        // Mock transaction data
        const mockTransactions = Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          volume: (Math.random() * 1000000000000000000000).toString(),
          count: Math.floor(Math.random() * 100),
          transactionTypes: {
            buy: Math.floor(Math.random() * 50),
            sell: Math.floor(Math.random() * 30),
            transfer: Math.floor(Math.random() * 20),
          },
        }));

        setAnalytics({
          loading: false,
          tokenMetrics,
          dailyTransactions: mockTransactions,
          weeklyTransactions: mockTransactions,
          monthlyTransactions: mockTransactions,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setAnalytics((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, [token]);

  return analytics;
};
