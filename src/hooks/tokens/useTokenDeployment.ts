import { useCallback, useState } from "react";
import { Address, parseUnits } from "viem";
import { useWalletClient, usePublicClient } from "wagmi";
import { tokenFactoryAbi } from "@/contracts/abis/TokenFactory";
import { useTransactionHandler } from "../transactions";
import { TokenContract } from "@/providers/contract/ContractProvider";

export interface TokenDeploymentParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  factoryAddress: Address;
}

interface DeploymentState {
  loading: boolean;
  error: Error | null;
  tokenAddress: Address | null;
}

export const useTokenDeployment = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { handleTransaction } = useTransactionHandler();

  const [state, setState] = useState<DeploymentState>({
    loading: false,
    error: null,
    tokenAddress: null,
  });

  const deployToken = useCallback(
    async (params: TokenDeploymentParams) => {
      if (!walletClient || !publicClient) {
        throw new Error("Wallet not connected");
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { name, symbol, decimals, initialSupply, factoryAddress } =
          params;
        const parsedSupply = parseUnits(initialSupply, decimals);

        const hash = await handleTransaction(async () => {
          const hash = await walletClient.writeContract({
            address: factoryAddress,
            abi: tokenFactoryAbi,
            functionName: "createToken",
            args: [
              name,
              symbol,
              decimals,
              parsedSupply,
              walletClient.account.address,
            ],
          });

          return hash;
        });

        if (!hash) {
          throw new Error("Failed to deploy token");
        }

        // Attendre la confirmation et récupérer l'adresse du token
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (!receipt || !receipt.logs[0]) {
          throw new Error("Failed to get token address from receipt");
        }

        const tokenAddress = receipt.logs[0].address as Address;

        setState({
          loading: false,
          error: null,
          tokenAddress,
        });

        return {
          address: tokenAddress,
          name,
          symbol,
          decimals,
        } as TokenContract;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to deploy token"),
        }));
        throw error;
      }
    },
    [walletClient, publicClient, handleTransaction]
  );

  return {
    ...state,
    deployToken,
  };
};

export default useTokenDeployment;
