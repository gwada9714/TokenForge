import { useEffect } from 'react';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { TokenForgeAuthState } from '../types';
import { getWalletClient } from '@wagmi/core';
import { mainnet, sepolia } from '../../../config/chains';

export function useTokenForgeAuth(): TokenForgeAuthState {
  const { state: authState, actions: authActions } = useAuthState();
  const { state: walletState, actions: walletActions } = useWalletState();
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Synchroniser l'état du wallet avec Wagmi
  useEffect(() => {
    const syncWalletState = async () => {
      if (isConnected && address && chain) {
        const walletClient = await getWalletClient();
        const isCorrectNetwork = chain.id === mainnet.id || chain.id === sepolia.id;
        
        walletActions.connectWallet(
          address,
          chain.id,
          walletClient,
          isCorrectNetwork
        );
      } else {
        walletActions.disconnectWallet();
      }
    };

    syncWalletState();
  }, [isConnected, address, chain, walletActions]);

  // Vérifier si l'utilisateur est admin (à adapter selon votre logique)
  const isAdmin = authState.user?.email?.endsWith('@tokenforge.com') || false;

  // Vérifier si l'utilisateur peut créer un token
  const canCreateToken = isAdmin || (authState.isAuthenticated && walletState.isCorrectNetwork);

  // Vérifier si l'utilisateur peut utiliser les services
  const canUseServices = authState.isAuthenticated && walletState.isConnected && walletState.isCorrectNetwork;

  return {
    // Auth state
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,

    // Wallet state
    isConnected: walletState.isConnected,
    address: walletState.address,
    chainId: walletState.chainId,
    isCorrectNetwork: walletState.isCorrectNetwork,
    walletClient: walletState.walletClient,

    // Combined state
    isAdmin,
    canCreateToken,
    canUseServices,

    // Actions
    login: authActions.login,
    logout: async () => {
      authActions.logout();
      if (isConnected) {
        disconnect();
      }
    },
    updateUser: authActions.updateUser,
    setError: authActions.setError,
  };
}
