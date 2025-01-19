import { useEffect, useState, useCallback } from 'react';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { sepolia } from 'wagmi/chains';

interface WalletConnectionState {
  isInitialized: boolean;
  isConnected: boolean;
  isAdmin: boolean;
  isCorrectNetwork: boolean;
  address: string | undefined;
  chainId: number | undefined;
  hasError: boolean;
  errorMessage: string | null;
}

export const useWalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [state, setState] = useState<WalletConnectionState>({
    isInitialized: false,
    isConnected: false,
    isAdmin: false,
    isCorrectNetwork: false,
    address: undefined,
    chainId: undefined,
    hasError: false,
    errorMessage: null
  });

  // Vérifier le réseau
  useEffect(() => {
    if (chain) {
      setState(prev => ({
        ...prev,
        chainId: chain.id,
        isCorrectNetwork: chain.id === sepolia.id
      }));
    }
  }, [chain]);

  // Mettre à jour l'état de la connexion
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isConnected,
      address
    }));
  }, [isConnected, address]);

  // Vérifier le statut admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isConnected && address) {
        try {
          // Pour l'instant, on considère que l'adresse qui a déployé TokenFactory est admin
          const tokenFactoryOwner = import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA;
          setState(prev => ({
            ...prev,
            isAdmin: address.toLowerCase() === tokenFactoryOwner?.toLowerCase()
          }));
        } catch (error) {
          console.error("Erreur lors de la vérification du statut admin:", error);
          setState(prev => ({
            ...prev,
            isAdmin: false,
            hasError: true,
            errorMessage: "Erreur lors de la vérification du statut admin"
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isAdmin: false
        }));
      }
    };

    checkAdminStatus();
  }, [address, isConnected]);

  // Initialisation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setState(prev => ({
        ...prev,
        isInitialized: true
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      isAdmin: false,
      address: undefined,
      hasError: false,
      errorMessage: null
    }));
  }, [wagmiDisconnect]);

  return {
    ...state,
    disconnect
  };
};

export default useWalletConnection;
