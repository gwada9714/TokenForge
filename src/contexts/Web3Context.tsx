import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface Web3ContextType {
  isConnected: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isCorrectNetwork: boolean;
  isLoading: boolean;
  error: Error | null;
  network: {
    isSupported: boolean;
    isMainnet: boolean;
    isTestnet: boolean;
    currentNetwork: string | undefined;
    isSwitching: boolean;
    switchToTestnet: () => Promise<void>;
    switchToMainnet: () => Promise<void>;
  };
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();
  const { 
    isInitialized,
    hasError,
    errorMessage,
    connect
  } = useWalletConnection();
  const networkStatus = useNetworkStatus();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        setIsLoading(true);
        if (!isConnected && connector) {
          await connect();
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de Web3:', err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeWeb3();
  }, [isConnected, connector, connect]);

  // Réinitialiser l'erreur quand le réseau change
  useEffect(() => {
    if (chain && error) {
      setError(null);
    }
  }, [chain, error]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isConnected && address) {
        try {
          // Pour l'instant, on considère une adresse spécifique comme admin
          // À remplacer par une vraie vérification via le contrat
          const adminAddresses = [
            "0x1234567890123456789012345678901234567890", // Exemple d'adresse admin
            // Ajoutez d'autres adresses admin si nécessaire
          ];
          setIsAdmin(adminAddresses.includes(address.toLowerCase()));
        } catch (error) {
          console.error("Erreur lors de la vérification du statut admin:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [address, isConnected]);

  const value: Web3ContextType = {
    isConnected,
    isInitialized,
    isAdmin,
    address,
    chainId: chain?.id,
    isCorrectNetwork: networkStatus.isSupported,
    isLoading: isLoading || networkStatus.isSwitching,
    error: error || (hasError ? new Error(errorMessage || 'Erreur de connexion') : null),
    network: {
      isSupported: networkStatus.isSupported,
      isMainnet: networkStatus.isMainnet,
      isTestnet: networkStatus.isTestnet,
      currentNetwork: chain?.name,
      isSwitching: networkStatus.isSwitching,
      switchToTestnet: networkStatus.switchToTestnet,
      switchToMainnet: networkStatus.switchToMainnet,
    },
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
