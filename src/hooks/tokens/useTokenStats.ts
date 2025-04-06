import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { tokenStatsAbi } from "@/contracts/abis/tokenStats";
import { TokenContract } from "@/providers/contract/ContractProvider";

interface TokenStats {
  totalSupply: {
    raw: bigint;
    formatted: string;
  };
  circulatingSupply: {
    raw: bigint;
    formatted: string;
  };
  holders: number;
  loading: boolean;
  error: Error | null;
}

export const useTokenStats = (token?: TokenContract) => {
  const publicClient = usePublicClient();
  const [stats, setStats] = useState<TokenStats>({
    totalSupply: {
      raw: 0n,
      formatted: "0",
    },
    circulatingSupply: {
      raw: 0n,
      formatted: "0",
    },
    holders: 0,
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!token || !publicClient) {
      return;
    }

    setStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [totalSupply, circulatingSupply, holders] =
        await publicClient.multicall({
          contracts: [
            {
              address: token.address,
              abi: tokenStatsAbi,
              functionName: "totalSupply",
            },
            {
              address: token.address,
              abi: tokenStatsAbi,
              functionName: "circulatingSupply",
            },
            {
              address: token.address,
              abi: tokenStatsAbi,
              functionName: "holders",
            },
          ],
        });

      if (!totalSupply.result || !circulatingSupply.result || !holders.result) {
        throw new Error("Failed to fetch token stats");
      }

      setStats({
        totalSupply: {
          raw: totalSupply.result,
          formatted: formatUnits(totalSupply.result, token.decimals),
        },
        circulatingSupply: {
          raw: circulatingSupply.result,
          formatted: formatUnits(circulatingSupply.result, token.decimals),
        },
        holders: Number(holders.result),
        loading: false,
        error: null,
      });
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch token stats"),
      }));
    }
  }, [token, publicClient]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...stats,
    refetch: fetchStats,
  };
};

export default useTokenStats;
