import { useState, useEffect } from 'react';
import { web3Service } from '../services/web3';
import { useAccount } from 'wagmi';
import { useWeb3 } from '../providers';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export const useTokenList = () => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { isConnected } = useWeb3();

  const loadTokens = async () => {
    if (!isConnected || !address) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const factory = await web3Service.getFactoryContract();
      const tokenAddresses = await factory.getTokensByCreator(address);

      const tokenPromises = tokenAddresses.map(async (tokenAddress) => {
        try {
          const token = await web3Service.getTokenContract(tokenAddress);
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply()
          ]);

          return {
            address: tokenAddress,
            name,
            symbol,
            decimals,
            totalSupply
          };
        } catch (err) {
          console.error(`Error loading token ${tokenAddress}:`, err);
          return null;
        }
      });

      const loadedTokens = (await Promise.all(tokenPromises))
        .filter((token): token is TokenInfo => token !== null);

      setTokens(loadedTokens);
    } catch (err) {
      console.error('Error loading tokens:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tokens');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [address, isConnected]);

  return {
    tokens,
    isLoading,
    error,
    refresh: loadTokens
  };
};
