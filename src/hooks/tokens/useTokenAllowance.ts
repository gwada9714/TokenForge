import { useCallback, useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { usePublicClient, useAccount, useWalletClient } from "wagmi";
import { TokenContract } from "@/providers/contract/ContractProvider";
import { erc20Abi } from "@/contracts/abis/erc20";
import { useTransactionHandler } from "../transactions";

interface TokenAllowance {
  raw: bigint;
  formatted: string;
  loading: boolean;
  error: Error | null;
}

export const useTokenAllowance = (token?: TokenContract, spender?: Address) => {
  const { address: owner } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { handleTransaction } = useTransactionHandler();

  const [allowance, setAllowance] = useState<TokenAllowance>({
    raw: 0n,
    formatted: "0",
    loading: false,
    error: null,
  });

  const fetchAllowance = useCallback(async () => {
    if (!token || !owner || !spender || !publicClient) {
      return;
    }

    setAllowance((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const rawAllowance = await publicClient.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spender],
      });

      setAllowance({
        raw: rawAllowance,
        formatted: formatUnits(rawAllowance, token.decimals),
        loading: false,
        error: null,
      });
    } catch (error) {
      setAllowance((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to fetch allowance"),
      }));
    }
  }, [token, owner, spender, publicClient]);

  const approve = useCallback(
    async (amount: bigint) => {
      if (!token || !spender || !walletClient) {
        throw new Error("Token, spender address, and wallet are required");
      }

      return handleTransaction(async () => {
        const hash = await walletClient.writeContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount],
        });

        return hash;
      });
    },
    [token, spender, walletClient, handleTransaction]
  );

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return {
    ...allowance,
    approve,
    refetch: fetchAllowance,
  };
};

export default useTokenAllowance;
