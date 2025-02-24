import { useCallback, useMemo } from 'react';
import { useWalletDetection } from './useWalletDetection';
import { useNetworkManagement, SupportedChainId } from './useNetworkManagement';
import { createAuthError } from '../errors/AuthError';

export const useAuthManager = (requiredChainId?: SupportedChainId) => {
  const wallet = useWalletDetection();
  const network = useNetworkManagement(wallet.provider);

  // Réinitialiser les erreurs
  const resetError = useCallback(() => {
    network.resetError();
  }, [network]);

  // Vérifier automatiquement le réseau si requis
  const ensureCorrectNetwork = useCallback(async () => {
    if (requiredChainId && wallet.provider) {
      return network.ensureNetwork(requiredChainId);
    }
    return true;
  }, [requiredChainId, wallet.provider, network.ensureNetwork]);

  // État combiné
  const state = useMemo(() => {
    const isReady = !wallet.isConnecting && 
                   !network.isChanging && 
                   wallet.account !== null &&
                   (!requiredChainId || wallet.chainId === requiredChainId);

    const error = wallet.error || network.error;

    return {
      isReady,
      isConnecting: wallet.isConnecting,
      isChangingNetwork: network.isChanging,
      account: wallet.account,
      chainId: wallet.chainId,
      provider: wallet.provider,
      error,
    };
  }, [
    wallet.isConnecting,
    wallet.account,
    wallet.chainId,
    wallet.provider,
    wallet.error,
    network.isChanging,
    network.error,
    requiredChainId,
  ]);

  // Actions combinées
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw createAuthError(
        'AUTH_001',
        'No Web3 provider detected. Please install MetaMask or another Web3 wallet.'
      );
    }

    try {
      // Demander la connexion au wallet
      await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Vérifier le réseau si nécessaire
      if (requiredChainId) {
        await network.ensureNetwork(requiredChainId);
      }

      return true;
    } catch (error) {
      throw createAuthError(
        'AUTH_009',
        'Failed to connect wallet',
        { originalError: error }
      );
    }
  }, [requiredChainId, network]);

  const disconnect = useCallback(() => {
    // Note: La plupart des wallets ne supportent pas la déconnexion programmatique
    // Nous pouvons seulement réinitialiser notre état local
    if (wallet.provider) {
      window.location.reload();
    }
  }, [wallet.provider]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork: network.switchNetwork,
    supportedNetworks: network.supportedNetworks,
    ensureCorrectNetwork,
    resetError,
  };
};
