import { useState, useEffect } from "react";
import { useContractRead, useAccount, usePublicClient } from "wagmi";
import { getNetwork } from "@/config/networks";
import TokenFactoryABI from "@/contracts/abi/TokenFactory";
import TokenABI from "@/contracts/abis";
import { Address, formatUnits } from "viem";

export interface TokenData {
  address: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
  owner: Address;
  network: ReturnType<typeof getNetwork>;
  createdAt: Date;
  features: {
    isBurnable: boolean;
    isMintable: boolean;
    isPausable: boolean;
    hasMaxWallet: boolean;
    hasMaxTransaction: boolean;
    hasAntiBot: boolean;
    hasBlacklist: boolean;
    premium: boolean;
  };
  taxConfig: {
    enabled: boolean;
    buyTax: number;
    sellTax: number;
    transferTax: number;
    taxRecipient: Address;
    taxStats?: {
      totalTaxCollected: number;
      totalTransactions: number;
    };
  };
  stats: {
    holders: number;
    transactions: number;
    price: string;
    marketCap: string;
  };
}

export const useUserTokens = (chainId?: number) => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { address } = useAccount();
  const network = chainId ? getNetwork(chainId) : undefined;
  const publicClient = usePublicClient();

  const { data: tokenAddresses, isLoading: isLoadingAddresses } =
    useContractRead({
      address: network?.factoryAddress,
      abi: TokenFactoryABI,
      functionName: "getTokensByOwner",
      args: address ? [address] : undefined,
      chainId,
      enabled: !!address && !!network?.factoryAddress,
    });

  useEffect(() => {
    const fetchTokensData = async () => {
      if (
        !tokenAddresses ||
        !Array.isArray(tokenAddresses) ||
        !address ||
        !network ||
        !publicClient
      ) {
        setTokens([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const tokenPromises = tokenAddresses.map(
          async (tokenAddress: Address) => {
            // Lecture des données de base du token
            const [
              name,
              symbol,
              totalSupply,
              decimals,
              owner,
              features,
              taxConfig,
              creationData,
            ] = await Promise.all([
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "name",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "symbol",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "totalSupply",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "decimals",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "owner",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "getFeatures",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "getTaxConfig",
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: TokenABI,
                functionName: "getCreationData",
              }),
            ]);

            // Construction de l'objet TokenData
            const tokenData: TokenData = {
              address: tokenAddress,
              name: name as string,
              symbol: symbol as string,
              totalSupply: totalSupply as bigint,
              decimals: decimals as number,
              owner: owner as Address,
              network,
              createdAt: new Date(
                (creationData as { timestamp: number }).timestamp * 1000
              ),
              features: {
                isBurnable: (features as any).isBurnable,
                isMintable: (features as any).isMintable,
                isPausable: (features as any).isPausable,
                hasMaxWallet: (features as any).hasMaxWallet,
                hasMaxTransaction: (features as any).hasMaxTransaction,
                hasAntiBot: (features as any).hasAntiBot,
                hasBlacklist: (features as any).hasBlacklist,
                premium: (features as any).premium,
              },
              taxConfig: {
                enabled: (taxConfig as any).enabled,
                buyTax: Number(formatUnits((taxConfig as any).buyTax, 2)),
                sellTax: Number(formatUnits((taxConfig as any).sellTax, 2)),
                transferTax: Number(
                  formatUnits((taxConfig as any).transferTax, 2)
                ),
                taxRecipient: (taxConfig as any).recipient,
              },
              stats: {
                holders: 0, // À implémenter avec un indexeur
                transactions: 0, // À implémenter avec un indexeur
                price: "0", // À implémenter avec l'API DEX
                marketCap: "0", // À calculer une fois le prix disponible
              },
            };

            return tokenData;
          }
        );

        const tokensData = await Promise.all(tokenPromises);
        setTokens(tokensData);
      } catch (err) {
        console.error("Error fetching tokens data:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokensData();
  }, [tokenAddresses, address, network, publicClient]);

  return {
    tokens,
    isLoading: isLoading || isLoadingAddresses,
    error,
  };
};
