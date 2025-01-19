import { useEffect, useState, useCallback } from 'react';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from './useLocalStorage';

interface WalletConnectionState {
  isInitialized: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  errorMessage: string | null;
  retryCount: number;
  lastConnectedAddress: string | null;
}

interface UseWalletConnectionReturn extends WalletConnectionState {
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;
  resetError: () => void;
}

const MAX_RETRIES = 3;

export const useWalletConnection = (): UseWalletConnectionReturn => {
  const { address, connector, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [lastConnectedAddress, setLastConnectedAddress] = useLocalStorage<string | null>('lastConnectedAddress', null);

  const [state, setState] = useState<WalletConnectionState>({
    isInitialized: false,
    isConnecting: false,
    isReconnecting: false,
    hasError: false,
    errorMessage: null,
    retryCount: 0,
    lastConnectedAddress: null,
  });

  // Réinitialiser les erreurs
  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
      errorMessage: null,
      retryCount: 0,
    }));
  }, []);

  // Gérer les erreurs de connexion
  const handleConnectionError = useCallback((error: Error) => {
    console.error('Erreur de connexion wallet:', error);
    setState(prev => ({
      ...prev,
      hasError: true,
      errorMessage: error.message,
      isConnecting: false,
      isReconnecting: false,
    }));
    toast.error(`Erreur de connexion: ${error.message}`);
  }, []);

  // Tenter la connexion
  const connect = useCallback(async () => {
    if (!connector) {
      handleConnectionError(new Error('Aucun wallet détecté'));
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      await connector.connect();
      resetError();
    } catch (error) {
      handleConnectionError(error as Error);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [connector, handleConnectionError, resetError]);

  // Fonction de déconnexion
  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setState(prev => ({
      ...prev,
      isInitialized: true,
      hasError: false,
      errorMessage: null,
      retryCount: 0,
      isConnecting: false,
      isReconnecting: false,
    }));
    setLastConnectedAddress(null);
  }, [wagmiDisconnect, setLastConnectedAddress]);

  // Fonction de retry
  const retry = useCallback(async () => {
    if (state.retryCount >= MAX_RETRIES) {
      handleConnectionError(new Error('Nombre maximum de tentatives atteint'));
      return;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isReconnecting: true,
    }));

    try {
      await connect();
    } finally {
      setState(prev => ({ ...prev, isReconnecting: false }));
    }
  }, [state.retryCount, connect, handleConnectionError]);

  // Effet pour gérer la reconnexion automatique
  useEffect(() => {
    if (address && isConnected) {
      setLastConnectedAddress(address);
      setState(prev => ({
        ...prev,
        isInitialized: true,
        hasError: false,
        errorMessage: null,
        isConnecting: false,
        isReconnecting: false,
      }));
    }
  }, [address, isConnected, setLastConnectedAddress]);

  // Effet pour vérifier le changement de réseau
  useEffect(() => {
    if (chain && !state.isInitialized) {
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  }, [chain, state.isInitialized]);

  return {
    ...state,
    lastConnectedAddress,
    connect,
    disconnect,
    retry,
    resetError,
  };
};
