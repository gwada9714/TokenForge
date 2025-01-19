import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';

export const useNetworkManagement = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  const isCorrectNetwork = chainId === sepolia.id;

  const switchToCorrectNetwork = async () => {
    if (!isConnected) return;
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return {
    isCorrectNetwork,
    switchToCorrectNetwork,
    chainId,
  };
};
