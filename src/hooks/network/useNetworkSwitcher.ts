import { useCallback, useState } from "react";
import { useConfig, useSwitchChain } from "wagmi";
import { Chain } from "viem";

export const useNetworkSwitcher = () => {
  const { chains } = useConfig();
  const {
    switchChain,
    isPending: isSwitching,
    error: switchError,
  } = useSwitchChain();
  const [targetChainId, setTargetChainId] = useState<number | null>(null);

  const switchToNetwork = useCallback(
    async (chainId: number) => {
      if (switchChain) {
        try {
          setTargetChainId(chainId);
          await switchChain({ chainId });
          return true;
        } catch (error) {
          console.error("Failed to switch network:", error);
          return false;
        } finally {
          setTargetChainId(null);
        }
      }
      return false;
    },
    [switchChain]
  );

  const getTargetNetwork = useCallback(
    (chainId: number): Chain | undefined => {
      return chains.find((chain) => chain.id === chainId);
    },
    [chains]
  );

  return {
    switchToNetwork,
    getTargetNetwork,
    isSwitching,
    targetChainId,
    switchError,
    supportedChains: chains,
  };
};

export default useNetworkSwitcher;
