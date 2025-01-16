import { useState, useEffect } from 'react';
import { useContract } from './useContract';
import { TKN_TOKEN_ADDRESS } from '@/constants/tokenforge';
import TokenForgeToken from '@/contracts/TokenForgeToken.json';
import { BigNumber } from 'ethers';

interface TokenForgeStats {
  totalTaxCollected: BigNumber;
  totalTaxToForge: BigNumber;
  totalTaxToDevFund: BigNumber;
  totalTaxToBuyback: BigNumber;
  totalTaxToStaking: BigNumber;
  totalTransactions: number;
  totalValueLocked: BigNumber;
  isLoading: boolean;
  taxHistory: Array<{
    date: string;
    taxAmount: number;
  }>;
}

export const useTokenForgeStats = () => {
  const [stats, setStats] = useState<TokenForgeStats>({
    totalTaxCollected: BigNumber.from(0),
    totalTaxToForge: BigNumber.from(0),
    totalTaxToDevFund: BigNumber.from(0),
    totalTaxToBuyback: BigNumber.from(0),
    totalTaxToStaking: BigNumber.from(0),
    totalTransactions: 0,
    totalValueLocked: BigNumber.from(0),
    isLoading: true,
    taxHistory: []
  });

  const contract = useContract(TKN_TOKEN_ADDRESS[1], TokenForgeToken.abi);

  const fetchStats = async () => {
    if (!contract) return;

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

      // Fetch tax collection events for history
      const filter = contract.filters.TaxCollected();
      const events = await contract.queryFilter(filter, -10000); // Last 10000 blocks
      
      const taxHistory = events.map(event => ({
        date: new Date(event.blockTimestamp * 1000).toLocaleDateString(),
        taxAmount: Number(event.args?.taxAmount.toString()) / 1e18
      }));

      setStats({
        totalTaxCollected,
        totalTaxToForge,
        totalTaxToDevFund,
        totalTaxToBuyback,
        totalTaxToStaking,
        totalTransactions: totalTransactions.toNumber(),
        totalValueLocked,
        isLoading: false,
        taxHistory
      });
    } catch (error) {
      console.error('Error fetching TokenForge stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up event listeners for real-time updates
    if (contract) {
      const taxCollectedFilter = contract.filters.TaxCollected();
      contract.on(taxCollectedFilter, () => {
        fetchStats();
      });

      return () => {
        contract.removeAllListeners(taxCollectedFilter);
      };
    }
  }, [contract]);

  return stats;
};

export default useTokenForgeStats;
