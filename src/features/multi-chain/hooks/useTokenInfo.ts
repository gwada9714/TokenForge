import { useState, useEffect } from 'react';
import { PaymentNetwork } from '../services/payment/types/PaymentSession';

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  estimatedGasFee?: number;
}

export const useTokenInfo = (network: PaymentNetwork, tokenAddress: string) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual token info API calls
        const mockTokenInfo: TokenInfo = {
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          icon: '/assets/tokens/usdc.svg',
          estimatedGasFee: 0.001,
        };

        setTokenInfo(mockTokenInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load token info');
      } finally {
        setIsLoading(false);
      }
    };

    if (tokenAddress) {
      fetchTokenInfo();
    }
  }, [network, tokenAddress]);

  return { tokenInfo, isLoading, error };
};
