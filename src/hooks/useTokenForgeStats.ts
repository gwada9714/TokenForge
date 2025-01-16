import { useState, useEffect } from 'react';
import { useWeb3Provider } from './useWeb3Provider';
import { TKN_TOKEN_ADDRESS } from '@/constants/tokenforge';
import { Contract, BigNumber } from 'ethers';

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
    timestamp: number;
    amount: BigNumber;
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
        const taxHistory = events.map((event) => ({
          timestamp: event.args?.timestamp.toNumber(),
          amount: event.args?.amount
        }));

        setStats({
          totalTaxCollected,
          totalTaxToForge,
          totalTaxToDevFund,
          totalTaxToBuyback,
          totalTaxToStaking,
          totalTransactions,
          totalValueLocked,
          isLoading: false,
          taxHistory
        });
      } catch (error) {
        console.error('Error fetching token stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();

    const taxCollectedFilter = contract.filters.TaxCollected();
    contract.on(taxCollectedFilter, () => {
      fetchStats();
    });

    return () => {
      contract.removeAllListeners();
    };
  }, [contract]);

  return stats;
};

export default useTokenForgeStats;
