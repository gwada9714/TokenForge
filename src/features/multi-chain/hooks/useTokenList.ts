import { useState, useEffect } from 'react';
import { PaymentNetwork } from '../services/payment/types/PaymentSession';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  balance?: string;
}

export const useTokenList = (network: PaymentNetwork) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual token list API calls
        const mockTokens: Token[] = [
          {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            icon: '/assets/tokens/usdt.svg',
            balance: '1000.00',
          },
          {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            icon: '/assets/tokens/usdc.svg',
            balance: '500.00',
          },
          {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            symbol: 'DAI',
            name: 'Dai Stablecoin',
            decimals: 18,
            icon: '/assets/tokens/dai.svg',
            balance: '750.00',
          },
        ];

        setTokens(mockTokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [network]);

  return { tokens, isLoading, error };
};
