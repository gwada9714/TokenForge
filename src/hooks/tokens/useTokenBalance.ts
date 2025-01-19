import { useCallback, useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { usePublicClient, useAccount } from 'wagmi';
import { TokenContract } from '@/providers/contract/ContractProvider';
import { erc20Abi } from '@/contracts/abis/erc20';

interface TokenBalance {
  raw: bigint;
  formatted: string;
  symbol: string;
  loading: boolean;
  error: Error | null;
}

export const useTokenBalance = (token?: TokenContract) => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<TokenBalance>({
    raw: 0n,
    formatted: '0',
    symbol: '',
    loading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!token || !account || !publicClient) {
      return;
    }

    setBalance(prev => ({ ...prev, loading: true, error: null }));

    try {
      const rawBalance = await publicClient.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      });

      setBalance({
        raw: rawBalance,
        formatted: formatUnits(rawBalance, token.decimals),
        symbol: token.symbol,
        loading: false,
        error: null,
      });
    } catch (error) {
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Failed to fetch balance'),
      }));
    }
  }, [token, account, publicClient]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    ...balance,
    refetch: fetchBalance,
  };
};

export default useTokenBalance;
