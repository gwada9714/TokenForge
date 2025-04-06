import React, { createContext, useContext, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../providers/Web3Provider";
import { web3Service } from "../services/web3";

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  features?: {
    mintable: boolean;
    burnable: boolean;
  };
}

interface TokenContextType {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  createToken: (params: CreateTokenParams) => Promise<void>;
  loadTokens: () => Promise<void>;
}

interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
}

const TokenContext = createContext<TokenContextType | null>(null);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useWeb3();

  const loadTokens = useCallback(async () => {
    if (!isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const factory = await web3Service.getFactoryContract();
      const signer = await web3Service.getSigner();
      const userAddress = await signer.getAddress();

      const tokenAddresses = await factory.getTokensByCreator(userAddress);
      const tokenPromises = tokenAddresses.map(async (address) => {
        const token = await web3Service.getTokenContract(address);
        const [name, symbol, totalSupply] = await Promise.all([
          token.name(),
          token.symbol(),
          token.totalSupply(),
        ]);

        return {
          address,
          name,
          symbol,
          totalSupply: ethers.formatUnits(totalSupply, 18),
          features: {
            mintable: await token.isMintable(),
            burnable: await token.isBurnable(),
          },
        };
      });

      const loadedTokens = await Promise.all(tokenPromises);
      setTokens(loadedTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tokens");
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const createToken = useCallback(
    async (params: CreateTokenParams) => {
      if (!isConnected) throw new Error("Wallet not connected");

      setIsLoading(true);
      setError(null);

      try {
        const factory = await web3Service.getFactoryContract();
        const tx = await factory.createToken(
          params.name,
          params.symbol,
          params.decimals,
          ethers.parseUnits(params.totalSupply, params.decimals),
          params.burnable,
          params.mintable,
          params.pausable
        );

        await tx.wait();
        await loadTokens();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create token");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, loadTokens]
  );

  return (
    <TokenContext.Provider
      value={{
        tokens,
        isLoading,
        error,
        createToken,
        loadTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
};
