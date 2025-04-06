import { useAccount, useChainId, useConfig } from "wagmi";
import { useCallback } from "react";

export const useNetworkStatus = () => {
  const chainId = useChainId();
  const { chains } = useConfig();
  const { isConnected } = useAccount();

  const isSupported = useCallback(() => {
    return chainId ? chains.some((c) => c.id === chainId) : false;
  }, [chainId, chains]);

  const getNetworkName = useCallback(() => {
    const currentChain = chains.find((c) => c.id === chainId);
    return currentChain?.name || "Unknown Network";
  }, [chainId, chains]);

  const getChainId = useCallback(() => {
    return chainId;
  }, [chainId]);

  return {
    currentChainId: chainId,
    isConnected,
    supportedChains: chains,
    isSupported,
    getNetworkName,
    getChainId,
  };
};

export default useNetworkStatus;
