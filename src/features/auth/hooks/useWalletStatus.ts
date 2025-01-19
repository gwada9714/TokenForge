import { useTokenForgeAuthContext } from '../context/TokenForgeAuthProvider';

export const useWalletStatus = () => {
  const { isConnected, address, chainId, isCorrectNetwork, provider } = useTokenForgeAuthContext();

  return {
    isConnected,
    address,
    chainId,
    isCorrectNetwork,
    provider,
    isReady: isConnected && isCorrectNetwork,
  };
};
