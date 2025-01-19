import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';
import { TokenEvent, useTokenEvents } from '../tokens/useTokenEvents';
import { TokenContract } from '@/providers/contract/ContractProvider';

interface HolderData {
  address: Address;
  balance: string;
  percentage: number;
  transactions: number;
}

interface TransactionData {
  date: string;
  volume: string;
  count: number;
}

interface TokenAnalytics {
  topHolders: HolderData[];
  dailyTransactions: TransactionData[];
  weeklyTransactions: TransactionData[];
  monthlyTransactions: TransactionData[];
  loading: boolean;
  error: Error | null;
}

export const useTokenAnalytics = (token?: TokenContract) => {
  const { events, loading: eventsLoading, error: eventsError } = useTokenEvents(token);
  const [analytics, setAnalytics] = useState<TokenAnalytics>({
    topHolders: [],
    dailyTransactions: [],
    weeklyTransactions: [],
    monthlyTransactions: [],
    loading: false,
    error: null,
  });

  const processEvents = useCallback((events: TokenEvent[]) => {
    const holderBalances = new Map<Address, bigint>();
    const holderTransactions = new Map<Address, number>();

    events.forEach(event => {
      if (event.type === 'transfer') {
        holderTransactions.set(event.from, (holderTransactions.get(event.from) || 0) + 1);
        holderTransactions.set(event.to, (holderTransactions.get(event.to) || 0) + 1);

        const fromBalance = holderBalances.get(event.from) || 0n;
        const toBalance = holderBalances.get(event.to) || 0n;
        holderBalances.set(event.from, fromBalance - event.value.raw);
        holderBalances.set(event.to, toBalance + event.value.raw);
      }
    });

    const totalSupply = Array.from(holderBalances.values()).reduce((a, b) => a + b, 0n);

    const holders: HolderData[] = Array.from(holderBalances.entries())
      .map(([address, balance]) => ({
        address,
        balance: balance.toString(),
        percentage: Number((balance * 10000n / totalSupply)) / 100,
        transactions: holderTransactions.get(address) || 0,
      }))
      .sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)))
      .slice(0, 10);

    const dailyData = new Map<string, { volume: bigint; count: number }>();
    const weeklyData = new Map<string, { volume: bigint; count: number }>();
    const monthlyData = new Map<string, { volume: bigint; count: number }>();

    events
      .filter(event => event.type === 'transfer')
      .forEach(event => {
        const date = new Date(event.timestamp * 1000);
        const dayKey = date.toISOString().split('T')[0];
        const weekKey = getWeekKey(date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const dayData = dailyData.get(dayKey) || { volume: 0n, count: 0 };
        dailyData.set(dayKey, {
          volume: dayData.volume + event.value.raw,
          count: dayData.count + 1,
        });

        const weekData = weeklyData.get(weekKey) || { volume: 0n, count: 0 };
        weeklyData.set(weekKey, {
          volume: weekData.volume + event.value.raw,
          count: weekData.count + 1,
        });

        const monthData = monthlyData.get(monthKey) || { volume: 0n, count: 0 };
        monthlyData.set(monthKey, {
          volume: monthData.volume + event.value.raw,
          count: monthData.count + 1,
        });
      });

    setAnalytics({
      topHolders: holders,
      dailyTransactions: formatTransactionData(dailyData),
      weeklyTransactions: formatTransactionData(weeklyData),
      monthlyTransactions: formatTransactionData(monthlyData),
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (eventsLoading || eventsError) {
      setAnalytics(prev => ({
        ...prev,
        loading: eventsLoading,
        error: eventsError,
      }));
      return;
    }

    if (events.length > 0) {
      processEvents(events);
    }
  }, [events, eventsLoading, eventsError, processEvents]);

  return analytics;
};

const getWeekKey = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek.toISOString().split('T')[0];
};

const formatTransactionData = (
  data: Map<string, { volume: bigint; count: number }>
): TransactionData[] => {
  return Array.from(data.entries())
    .map(([date, { volume, count }]) => ({
      date,
      volume: volume.toString(),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export default useTokenAnalytics;
