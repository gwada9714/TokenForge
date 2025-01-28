import { useState, useEffect } from 'react';
import { useWeb3Provider } from './useWeb3Provider';
import { TAX_SYSTEM_ADDRESS } from '@/constants/tokenforge';
import { TokenForgeStats } from '@/types/tokenforge';

const TAX_SYSTEM_ABI = [
  {
    type: 'function',
    name: 'totalTaxCollected',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'totalTransactions',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  }
] as const;

export const useTokenForgeStats = () => {
  const [stats, setStats] = useState<TokenForgeStats>({
    totalDistributed: 0n,
    lastDistributionTime: 0n,
    isLoading: true
  });

  const { publicClient } = useWeb3Provider();

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicClient) return;

      try {
        const [totalDistributed, lastDistributionTime] = await Promise.all([
          publicClient.readContract({
            address: TAX_SYSTEM_ADDRESS as `0x${string}`,
            abi: TAX_SYSTEM_ABI,
            functionName: 'totalTaxCollected'
          }),
          Promise.resolve(0n) // Temporaire : on retourne 0 pour lastDistributionTime
        ]);

        setStats(prev => ({
          ...prev,
          totalDistributed,
          lastDistributionTime,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error fetching contract stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    void fetchStats();
  }, [publicClient]);

  return stats;
};

export default useTokenForgeStats;
