import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { TokenContract } from "@/providers/contract/ContractProvider";
import { erc20Abi } from "@/contracts/abis/erc20";

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  loading: boolean;
  error: Error | null;
}

export const useTokenMetadata = (token?: TokenContract) => {
  const publicClient = usePublicClient();
  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: "",
    symbol: "",
    decimals: 18,
    totalSupply: 0n,
    loading: false,
    error: null,
  });

  const fetchMetadata = useCallback(async () => {
    if (!token || !publicClient) {
      return;
    }

    setMetadata((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "name",
        }),
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "symbol",
        }),
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "decimals",
        }),
        publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "totalSupply",
        }),
      ]);

      setMetadata({
        name,
        symbol,
        decimals,
        totalSupply,
        loading: false,
        error: null,
      });
    } catch (error) {
      setMetadata((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch metadata"),
      }));
    }
  }, [token, publicClient]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    ...metadata,
    refetch: fetchMetadata,
  };
};

export default useTokenMetadata;
