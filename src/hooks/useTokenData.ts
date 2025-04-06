import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../contexts/Web3Context";

// Define the token data type
export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  balance: string;
  price?: string;
  marketCap?: string;
  holders?: number;
  transactions?: number;
}

// Define the hook return type
interface UseTokenDataReturn {
  tokens: TokenData[];
  isLoading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
  getTokenDetails: (address: string) => Promise<TokenData | null>;
}

/**
 * Hook for fetching token data
 * @returns Functions and state for token data
 */
export const useTokenData = (): UseTokenDataReturn => {
  const { isConnected, account } = useWeb3();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tokens owned by the connected account
  const fetchTokens = useCallback(async (): Promise<void> => {
    if (!isConnected || !account) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would fetch tokens from the blockchain
      // For now, we'll simulate some token data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockTokens: TokenData[] = [
        {
          address: "0x" + "1".repeat(40),
          name: "Mock Token 1",
          symbol: "MTK1",
          totalSupply: "1000000",
          decimals: 18,
          balance: "100",
          price: "0.05",
          marketCap: "50000",
          holders: 120,
          transactions: 450,
        },
        {
          address: "0x" + "2".repeat(40),
          name: "Mock Token 2",
          symbol: "MTK2",
          totalSupply: "500000",
          decimals: 18,
          balance: "50",
          price: "0.1",
          marketCap: "50000",
          holders: 75,
          transactions: 230,
        },
      ];

      setTokens(mockTokens);
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Fetch tokens on mount and when account changes
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Refresh tokens
  const refreshTokens = useCallback(async (): Promise<void> => {
    await fetchTokens();
  }, [fetchTokens]);

  // Get token details
  const getTokenDetails = useCallback(
    async (address: string): Promise<TokenData | null> => {
      if (!isConnected) {
        setError("Wallet not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would fetch token details from the blockchain
        // For now, we'll simulate token details
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if we already have this token in our list
        const existingToken = tokens.find(
          (t) => t.address.toLowerCase() === address.toLowerCase()
        );
        if (existingToken) {
          return existingToken;
        }

        // Simulate a new token
        return {
          address,
          name: "New Token",
          symbol: "NEW",
          totalSupply: "1000000",
          decimals: 18,
          balance: "0",
          price: "0.01",
          marketCap: "10000",
          holders: 50,
          transactions: 100,
        };
      } catch (err) {
        console.error("Error fetching token details:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, tokens]
  );

  return {
    tokens,
    isLoading,
    error,
    refreshTokens,
    getTokenDetails,
  };
};
