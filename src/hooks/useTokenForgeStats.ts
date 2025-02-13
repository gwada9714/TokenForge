import { useState, useEffect } from 'react';
import { useWeb3Provider } from './useWeb3Provider';
import { TKN_TOKEN_ADDRESS } from '@/constants/tokenforge';
import { Contract } from 'ethers';
import { TokenForgeStats, TaxCollectedEvent } from '@/types/tokenforge';

const TOKEN_FORGE_ABI = [
  'function totalTaxCollected() view returns (uint256)',
  'function totalTaxToForge() view returns (uint256)',
  'function totalTaxToDevFund() view returns (uint256)',
  'function totalTaxToBuyback() view returns (uint256)',
  'function totalTaxToStaking() view returns (uint256)',
  'function totalTransactions() view returns (uint256)',
  'function totalValueLocked() view returns (uint256)',
  'event TaxCollected(address indexed from, uint256 amount, uint256 timestamp)'
] as const;

export const useTokenForgeStats = () => {
  const [stats, setStats] = useState<TokenForgeStats>({
    totalTaxCollected: 0n,
    totalTaxToForge: 0n,
    totalTaxToDevFund: 0n,
    totalTaxToBuyback: 0n,
    totalTaxToStaking: 0n,
    totalTransactions: 0,
    totalValueLocked: 0n,
    isLoading: true,
    taxHistory: []
  });

  const { provider } = useWeb3Provider();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!provider) return;
    
    const tokenContract = new Contract(
      TKN_TOKEN_ADDRESS[1],
      TOKEN_FORGE_ABI,
      provider
    );
    
    setContract(tokenContract);
  }, [provider]);

  useEffect(() => {
    if (!contract) return;

    const fetchStats = async () => {
      try {
        const [
          totalTaxCollected,
          totalTaxToForge,
          totalTaxToDevFund,
          totalTaxToBuyback,
          totalTaxToStaking,
          totalTransactions,
          totalValueLocked
        ] = await Promise.all([
          contract.totalTaxCollected(),
          contract.totalTaxToForge(),
          contract.totalTaxToDevFund(),
          contract.totalTaxToBuyback(),
          contract.totalTaxToStaking(),
          contract.totalTransactions(),
          contract.totalValueLocked()
        ]);

        const taxEvent = contract.filters.TaxCollected();
        const events = await contract.queryFilter(taxEvent);
        const taxHistory = events.map((event) => {
          const eventData = event as unknown as { args: [string, bigint, bigint] };
          const [, amount, timestamp] = eventData.args;
          return {
            timestamp: Number(timestamp),
            amount
          };
        });

        setStats({
          totalTaxCollected: BigInt(totalTaxCollected.toString()),
          totalTaxToForge: BigInt(totalTaxToForge.toString()),
          totalTaxToDevFund: BigInt(totalTaxToDevFund.toString()),
          totalTaxToBuyback: BigInt(totalTaxToBuyback.toString()),
          totalTaxToStaking: BigInt(totalTaxToStaking.toString()),
          totalTransactions: Number(totalTransactions),
          totalValueLocked: BigInt(totalValueLocked.toString()),
          isLoading: false,
          taxHistory
        });
      } catch (error) {
        console.error('Error fetching TokenForge stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();

    // Écouter les nouveaux événements
    const handleTaxCollected = (from: string, amount: bigint, timestamp: bigint) => {
      setStats(prev => ({
        ...prev,
        taxHistory: [
          ...prev.taxHistory,
          { timestamp: Number(timestamp), amount }
        ]
      }));
    };

    contract.on('TaxCollected', handleTaxCollected);

    return () => {
      contract.off('TaxCollected', handleTaxCollected);
    };
  }, [contract]);

  return stats;
};

export default useTokenForgeStats;
