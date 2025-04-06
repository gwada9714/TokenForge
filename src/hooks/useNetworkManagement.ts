import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { Chain, mainnet, sepolia } from "viem/chains";

export const useNetworkManagement = (preferredChain: Chain) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  const isCorrectNetwork = chainId === preferredChain.id;
  const currentChainId = chainId;
  const isSwitching = false; // À gérer avec un état si nécessaire
  const supportedNetworks = [sepolia, mainnet];
  const isSupported = supportedNetworks.some(
    (network) => network.id === chainId
  );

  const switchToNetwork = async (targetChain: Chain) => {
    if (!isConnected) return;
    try {
      await switchChain({ chainId: targetChain.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const switchToCorrectNetwork = async () => {
    if (!isConnected) return;
    await switchToNetwork(preferredChain);
  };

  return {
    isCorrectNetwork,
    switchToCorrectNetwork,
    chainId,
    isSupported,
    isSwitching,
    currentChainId,
    switchToNetwork,
    supportedNetworks,
  };
};
