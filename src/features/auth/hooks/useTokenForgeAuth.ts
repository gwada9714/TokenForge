import { useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { useAuthState } from './useAuthState';
import { useWalletState } from './useWalletState';
import { TokenForgeAuth, TokenForgeUser } from '../types';
import { auth } from '../../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';

export function useTokenForgeAuth(): TokenForgeAuth {
  const authState = useAuthState();
  const { state: walletState, actions: walletActions } = useWalletState();
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const provider = usePublicClient();
  const { disconnect } = useDisconnect();

  // Synchroniser l'état du wallet avec Wagmi
  useEffect(() => {
    const syncWalletState = async () => {
      if (isConnected && address && chainId) {
        try {
          walletActions.connectWallet(
            address,
            chainId,
            walletClient,
            provider
          );
        } catch (error) {
          console.error('Failed to sync wallet state:', error);
          walletActions.disconnectWallet();
        }
      } else {
        walletActions.disconnectWallet();
      }
    };

    syncWalletState();
  }, [isConnected, address, chainId, walletClient, provider, walletActions]);

  // Mettre à jour le provider quand il change
  useEffect(() => {
    if (provider) {
      walletActions.updateProvider(provider);
    }
  }, [provider, walletActions]);

  // Mettre à jour le réseau quand il change
  useEffect(() => {
    if (chainId) {
      walletActions.updateNetwork(chainId);
    }
  }, [chainId, walletActions]);

  // Logique centralisée pour le login avec email/mot de passe
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const user = credential.user as TokenForgeUser;
      
      if (!user.emailVerified) {
        await authState.startEmailVerification();
      } else {
        await authState.verifyEmail();
      }
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError(
        AuthError.CODES.FIREBASE_ERROR,
        'Erreur lors de la connexion',
        { originalError: error }
      );
    }
  }, [authState]);

  // Logique centralisée pour le login avec un utilisateur existant
  const handleLoginWithUser = useCallback(async (user: TokenForgeUser) => {
    try {
      if (!user.emailVerified) {
        await authState.startEmailVerification();
      } else {
        await authState.verifyEmail();
      }
    } catch (error) {
      throw error instanceof AuthError ? error : new AuthError(
        AuthError.CODES.FIREBASE_ERROR,
        'Erreur lors de la connexion',
        { originalError: error }
      );
    }
  }, [authState]);

  // Logique centralisée pour le logout
  const handleLogout = useCallback(async () => {
    await authState.logout();
    if (isConnected) {
      disconnect();
    }
  }, [authState, isConnected, disconnect]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = authState.user?.email?.endsWith('@tokenforge.com') || false;

  // Vérifier si l'utilisateur peut créer un token
  const canCreateToken = isAdmin || (authState.isAuthenticated && walletState.isCorrectNetwork);

  // Vérifier si l'utilisateur peut utiliser les services
  const canUseServices = authState.isAuthenticated && walletState.isConnected && walletState.isCorrectNetwork;

  return {
    // Auth state
    status: authState.status,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    error: authState.error,
    emailVerified: authState.user?.emailVerified || false,

    // Wallet state
    ...walletState,

    // Combined state
    isAdmin,
    canCreateToken,
    canUseServices,

    // Actions
    login: handleLogin,
    loginWithUser: handleLoginWithUser,
    logout: handleLogout,
    updateUser: authState.updateUser,
    updateWalletState: walletActions.updateWalletState,
    startEmailVerification: authState.startEmailVerification,
    verifyEmail: authState.verifyEmail,
  };
}
