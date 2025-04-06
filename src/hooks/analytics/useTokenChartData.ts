import { useMemo } from "react";
import { formatUnits } from "viem";
import { TokenContract } from "@/providers/contract/ContractProvider";
import { useTokenAnalytics } from "./useTokenAnalytics";
import { ChartData, ChartDataset, ChartPeriod } from "@/types/analytics";

export type { ChartPeriod };

export const useTokenChartData = (
  token?: TokenContract,
  period: ChartPeriod = "daily"
) => {
  const analytics = useTokenAnalytics(token);

  const volumeData = useMemo((): ChartData | null => {
    if (!token || analytics.loading) {
      return null;
    }

    const transactionData =
      period === "daily"
        ? analytics.dailyTransactions
        : period === "weekly"
        ? analytics.weeklyTransactions
        : analytics.monthlyTransactions;

    const labels = transactionData.map((data) => data.date);
    const datasets: ChartDataset[] = [
      {
        label: "Volume",
        data: transactionData.map((data) =>
          Number(formatUnits(BigInt(data.volume), token.decimals))
        ),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
      },
    ];

    return { labels, datasets };
  }, [
    token,
    analytics.loading,
    analytics.dailyTransactions,
    analytics.weeklyTransactions,
    analytics.monthlyTransactions,
    period,
  ]);

  const holdersData = useMemo((): ChartData | null => {
    if (!token || analytics.loading || !analytics.tokenMetrics) {
      return null;
    }

    const { holders } = analytics.tokenMetrics;
    const total = Number(holders);
    const categories = {
      "Petits porteurs": Math.floor(total * 0.8),
      "Moyens porteurs": Math.floor(total * 0.15),
      "Grands porteurs": Math.floor(total * 0.05),
    };

    const labels = Object.keys(categories);
    const datasets: ChartDataset[] = [
      {
        label: "Détenteurs",
        data: Object.values(categories),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ];

    return { labels, datasets };
  }, [token, analytics.loading, analytics.tokenMetrics]);

  const transactionsData = useMemo((): ChartData | null => {
    if (!token || analytics.loading) {
      return null;
    }

    const transactionData =
      period === "daily"
        ? analytics.dailyTransactions
        : period === "weekly"
        ? analytics.weeklyTransactions
        : analytics.monthlyTransactions;

    const labels = transactionData.map((data) => data.date);
    const datasets: ChartDataset[] = [
      {
        label: "Achats",
        data: transactionData.map((data) => data.transactionTypes.buy),
        backgroundColor: "rgba(76, 175, 80, 0.8)",
      },
      {
        label: "Ventes",
        data: transactionData.map((data) => data.transactionTypes.sell),
        backgroundColor: "rgba(244, 67, 54, 0.8)",
      },
      {
        label: "Transferts",
        data: transactionData.map((data) => data.transactionTypes.transfer),
        backgroundColor: "rgba(33, 150, 243, 0.8)",
      },
    ];

    return { labels, datasets };
  }, [
    token,
    analytics.loading,
    analytics.dailyTransactions,
    analytics.weeklyTransactions,
    analytics.monthlyTransactions,
    period,
  ]);

  return {
    volumeData,
    holdersData,
    transactionsData,
    loading: analytics.loading,
  };
};
