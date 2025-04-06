import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient, useAccount } from "wagmi";
import { tokenFactoryAbi } from "@/contracts/abis/TokenFactory";
import { erc20Abi } from "@/contracts/abis/erc20";
import { TokenContract } from "@/providers/contract/ContractProvider";

interface TokenListState {
  tokens: TokenContract[];
  loading: boolean;
  error: Error | null;
}

export const useTokenList = (factoryAddress?: Address) => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState<TokenListState>({
    tokens: [],
    loading: false,
    error: null,
  });

  const fetchTokens = useCallback(async () => {
    if (!factoryAddress || !account || !publicClient) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Récupérer les adresses des tokens
      const addresses = (await publicClient.readContract({
        address: factoryAddress,
        abi: tokenFactoryAbi,
        functionName: "getTokens",
        args: [account],
      })) as Address[];

      // Récupérer les métadonnées pour chaque token
      const tokensPromises = addresses.map(async (address) => {
        const metadata = await publicClient.multicall({
          contracts: [
            {
              address,
              abi: erc20Abi,
              functionName: "name",
            },
            {
              address,
              abi: erc20Abi,
              functionName: "symbol",
            },
            {
              address,
              abi: erc20Abi,
              functionName: "decimals",
            },
          ],
        });

        if (!metadata[0].result || !metadata[1].result || !metadata[2].result) {
          throw new Error("Failed to fetch token metadata");
        }

        return {
          address,
          name: metadata[0].result as string,
          symbol: metadata[1].result as string,
          decimals: Number(metadata[2].result),
        } as TokenContract;
      });

      const tokens = await Promise.all(tokensPromises);

      setState({
        tokens,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to fetch tokens"),
      }));
    }
  }, [factoryAddress, account, publicClient]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    ...state,
    refetch: fetchTokens,
  };
};

export default useTokenList;
