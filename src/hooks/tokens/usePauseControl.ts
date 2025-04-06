import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { tokenControlAbi } from "@/contracts/abis/tokenControl";
import { useTransactionHandler } from "../transactions";

interface PauseState {
  isPaused: boolean;
  loading: boolean;
  error: Error | null;
}

export const usePauseControl = (tokenAddress?: Address) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { handleTransaction } = useTransactionHandler();

  const [state, setState] = useState<PauseState>({
    isPaused: false,
    loading: false,
    error: null,
  });

  const checkPauseStatus = useCallback(async () => {
    if (!tokenAddress || !publicClient) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const isPaused = await publicClient.readContract({
        address: tokenAddress,
        abi: tokenControlAbi,
        functionName: "paused",
      });

      setState({
        isPaused,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to check pause status"),
      }));
    }
  }, [tokenAddress, publicClient]);

  const pause = useCallback(async () => {
    if (!tokenAddress || !walletClient) {
      throw new Error("Token address and wallet are required");
    }

    return handleTransaction(async () => {
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: tokenControlAbi,
        functionName: "pause",
      });

      await checkPauseStatus();
      return hash;
    });
  }, [tokenAddress, walletClient, handleTransaction, checkPauseStatus]);

  const unpause = useCallback(async () => {
    if (!tokenAddress || !walletClient) {
      throw new Error("Token address and wallet are required");
    }

    return handleTransaction(async () => {
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: tokenControlAbi,
        functionName: "unpause",
      });

      await checkPauseStatus();
      return hash;
    });
  }, [tokenAddress, walletClient, handleTransaction, checkPauseStatus]);

  useEffect(() => {
    checkPauseStatus();
  }, [checkPauseStatus]);

  return {
    ...state,
    pause,
    unpause,
    refetch: checkPauseStatus,
  };
};

export default usePauseControl;
