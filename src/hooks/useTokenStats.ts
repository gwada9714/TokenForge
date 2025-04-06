import { useState, useEffect } from "react";
import { useContractRead, usePublicClient } from "wagmi";
import { getNetwork } from "@/config/networks";
import { TokenFactoryABI } from "@/contracts/abis/TokenFactory";

interface TokenStats {
  totalValue: bigint;
  transactionVolume: bigint;
  uniqueHolders: number;
}

export const useTokenStats = (chainId?: number) => {
  const [stats, setStats] = useState<TokenStats>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const network = chainId ? getNetwork(chainId) : undefined;
  const publicClient = usePublicClient();

  const {
    data: factoryStats,
    isError,
    isLoading: isLoadingStats,
  } = useContractRead({
    address: network?.factoryAddress,
    abi: TokenFactoryABI,
    functionName: "getStats",
    chainId,
    watch: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!network?.factoryAddress || !publicClient || isError) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (!network?.factoryAddress) {
          throw new Error("Network configuration not found");
        }

        // Si nous avons les stats du contrat factory
        if (factoryStats) {
          const [totalValue, volume, holders] = factoryStats as [
            bigint,
            bigint,
            number
          ];

          setStats({
            totalValue,
            transactionVolume: volume,
            uniqueHolders: holders,
          });
        }
      } catch (err) {
        console.error("Error fetching token stats:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch token stats")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [network?.factoryAddress, publicClient, factoryStats, isError]);

  return {
    stats,
    isLoading: isLoading || isLoadingStats,
    error,
  };
};
