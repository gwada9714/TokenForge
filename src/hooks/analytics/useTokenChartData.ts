import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { TokenContract } from '@/providers/contract/ContractProvider';
import { useTokenAnalytics } from './useTokenAnalytics';

export type ChartPeriod = 'daily' | 'weekly' | 'monthly';

interface VolumeChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface HolderChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export const useTokenChartData = (
  token?: TokenContract,
  period: ChartPeriod = 'daily'
) => {
  const analytics = useTokenAnalytics(token);

  const volumeData = useMemo(() => {
    if (!token || analytics.loading) {
      return null;
    }

    const transactionData = period === 'daily' 
      ? analytics.dailyTransactions 
      : period === 'weekly' 
        ? analytics.weeklyTransactions 
        : analytics.monthlyTransactions;

    const chartData: VolumeChartData = {
      labels: transactionData.map(data => data.date),
      datasets: [
        {
          label: 'Volume',
          data: transactionData.map(data => 
            Number(formatUnits(BigInt(data.volume), token.decimals))
          ),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f680',
        },
      ],
    };

    return chartData;
  }, [analytics, token, period]);

  const holdersData = useMemo(() => {
    if (!token || analytics.loading) {
      return null;
    }

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280'
    ];

    const chartData: HolderChartData = {
      labels: analytics.topHolders.map(holder => 
        `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`
      ),
      datasets: [
        {
          label: 'Holdings',
          data: analytics.topHolders.map(holder => holder.percentage),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };

    return chartData;
  }, [analytics, token]);

  const transactionCountData = useMemo(() => {
    if (!token || analytics.loading) {
      return null;
    }

    const transactionData = period === 'daily' 
      ? analytics.dailyTransactions 
      : period === 'weekly' 
        ? analytics.weeklyTransactions 
        : analytics.monthlyTransactions;

    const chartData: VolumeChartData = {
      labels: transactionData.map(data => data.date),
      datasets: [
        {
          label: 'Transactions',
          data: transactionData.map(data => data.count),
          borderColor: '#10b981',
          backgroundColor: '#10b98180',
        },
      ],
    };

    return chartData;
  }, [analytics, token, period]);

  return {
    volumeData,
    holdersData,
    transactionCountData,
    loading: analytics.loading,
    error: analytics.error,
  };
};

export default useTokenChartData;
