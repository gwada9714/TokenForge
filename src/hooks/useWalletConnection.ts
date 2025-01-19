import { useEffect, useState, useCallback } from 'react';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { toast } from 'react-hot-toast';

interface WalletConnectionState {
  isInitialized: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  errorMessage: string | null;
  retryCount: number;
}

interface UseWalletConnectionReturn extends WalletConnectionState {
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 secondes

export const useWalletConnection = (): UseWalletConnectionReturn => {
  const { address, isConnecting, isReconnecting, connector } = useAccount();
  const { chain } = useNetwork();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [state, setState] = useState<WalletConnectionState>({
    isInitialized: false,
    isConnecting: false,
    isReconnecting: false,
    hasError: false,
    errorMessage: null,
    retryCount: 0,
  });

  // Fonction pour gérer les erreurs de connexion
  const handleConnectionError = useCallback((error: Error) => {
    console.error('Erreur de connexion wallet:', error);
    setState(prev => ({
      ...prev,
      hasError: true,
      errorMessage: error.message,
    }));
    toast.error(`Erreur de connexion: ${error.message}`);
  }, []);

  // Fonction pour tenter la connexion
  const connect = useCallback(async () => {
    if (!connector) {
      handleConnectionError(new Error('Aucun wallet détecté'));
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, hasError: false, errorMessage: null }));
      await connector.connect();
    } catch (error) {
      handleConnectionError(error as Error);
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [connector, handleConnectionError]);

  // Fonction pour réessayer la connexion
  const retry = useCallback(async () => {
    if (state.retryCount >= MAX_RETRIES) {
      handleConnectionError(new Error('Nombre maximum de tentatives atteint'));
      return;
    }

    setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
    
    // Attendre avant de réessayer
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    await connect();
  }, [state.retryCount, connect, handleConnectionError]);

  // Fonction de déconnexion
  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setState(prev => ({
      ...prev,
      hasError: false,
      errorMessage: null,
      retryCount: 0,
    }));
  }, [wagmiDisconnect]);

  // Effet pour surveiller les changements de réseau
  useEffect(() => {
    if (chain && !chain.id.toString().match(/^(1|11155111)$/)) {
      toast.error('Veuillez vous connecter au réseau Ethereum ou Sepolia');
    }
  }, [chain]);

  // Effet pour l'initialisation
  useEffect(() => {
    if (!state.isInitialized && address) {
      setState(prev => ({ ...prev, isInitialized: true }));
    }
  }, [address, state.isInitialized]);

  return {
    ...state,
    isConnecting: state.isConnecting || isConnecting,
    isReconnecting: state.isReconnecting || isReconnecting,
    connect,
    disconnect,
    retry,
  };
};
