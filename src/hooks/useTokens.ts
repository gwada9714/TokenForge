import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export function useTokens() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        // TODO: Implémenter la récupération des tokens depuis le smart contract
        const mockTokens: Token[] = [
          {
            address: '0x1234...5678',
            name: 'Test Token',
            symbol: 'TST',
            totalSupply: '1000000',
          },
        ];
        setTokens(mockTokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchTokens();
    }
  }, [address]);

  return { tokens, isLoading, error };
}
