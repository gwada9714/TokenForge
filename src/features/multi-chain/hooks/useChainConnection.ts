import { useCallback, useEffect, useState } from 'react';
import { ChainId } from '../types/Chain';
import { getChainConfig } from '../config/chains';
import { useTokenForgeAuthContext } from '../../auth/providers/TokenForgeAuthProvider';

export const useChainConnection = (targetChainId: ChainId) => {
  const { state } = useTokenForgeAuthContext();
  const { provider, isConnected } = state.walletState;
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchChain = useCallback(async () => {
    if (!provider || !isConnected) return;
    
    try {
      setIsLoading(true);
      setError(null);

      if (targetChainId === ChainId.SOLANA) {
        // Solana ne nécessite pas de switch de chaîne comme les réseaux EVM
        setIsCorrectChain(true);
        return;
      }

      const chainConfig = getChainConfig(targetChainId);
      if (!chainConfig || 'cluster' in chainConfig) return;

      const hexChainId = `0x${chainConfig.chainId.toString(16)}`;

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }],
        });
      } catch (switchError: any) {
        // Code 4902 signifie que la chaîne n'a pas été ajoutée au wallet
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: hexChainId,
              chainName: chainConfig.name,
              nativeCurrency: chainConfig.nativeCurrency,
              rpcUrls: chainConfig.rpcUrls,
              blockExplorerUrls: chainConfig.blockExplorerUrls,
            }],
          });
        } else {
          throw switchError;
        }
      }

      setIsCorrectChain(true);
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      setIsCorrectChain(false);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected, targetChainId]);

  useEffect(() => {
    if (isConnected) {
      switchChain();
    }
  }, [isConnected, switchChain]);

  return {
    isCorrectChain,
    isLoading,
    error,
    switchChain,
  };
};
