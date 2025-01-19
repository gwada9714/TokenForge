import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { useNetwork, useAccount } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import type { Address } from 'viem';

// Types
interface ContractState {
  contractAddress: Address | null;
  isLoading: boolean;
  error: string | null;
  networkStatus: 'disconnected' | 'wrong_network' | 'connected';
}

interface ContractContextValue extends ContractState {
  refreshContract: () => Promise<void>;
}

// Valeurs par défaut
const defaultState: ContractState = {
  contractAddress: null,
  isLoading: false,
  error: null,
  networkStatus: 'disconnected'
};

// Création du contexte avec une valeur par défaut complète
const ContractContext = createContext<ContractContextValue>({
  ...defaultState,
  refreshContract: async () => {}
});

// Hook personnalisé pour utiliser le contexte
export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

// Props du provider
interface ContractProviderProps {
  children: ReactNode;
}

// Provider Component
export const ContractProvider = ({ children }: ContractProviderProps) => {
  const [state, setState] = useState<ContractState>(defaultState);
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  // Fonction de rafraîchissement du contrat
  const refreshContract = useCallback(async () => {
    console.log('Refreshing contract state...', { chain, address, isConnected });
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Vérification de la connexion
      if (!isConnected || !address) {
        setState(prev => ({
          ...prev,
          contractAddress: null,
          isLoading: false,
          error: null,
          networkStatus: 'disconnected'
        }));
        return;
      }

      // Vérification du réseau
      if (!chain) {
        throw new Error('Aucun réseau détecté');
      }

      // Vérification du réseau Sepolia
      if (chain.id !== 11155111) {
        setState(prev => ({
          ...prev,
          contractAddress: null,
          isLoading: false,
          error: 'Veuillez vous connecter au réseau Sepolia',
          networkStatus: 'wrong_network'
        }));
        return;
      }

      // Récupération de l'adresse du contrat
      const contractAddress = getContractAddress('TOKEN_FACTORY', chain.id);
      console.log('Contract address resolved:', contractAddress);

      setState({
        contractAddress,
        isLoading: false,
        error: null,
        networkStatus: 'connected'
      });
    } catch (error) {
      console.error('Error in contract refresh:', error);
      setState(prev => ({
        ...prev,
        contractAddress: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue',
        networkStatus: 'disconnected'
      }));
    }
  }, [chain, address, isConnected]);

  // Effet pour rafraîchir le contrat lors des changements importants
  useEffect(() => {
    refreshContract();
  }, [refreshContract]);

  // Mémoisation de la valeur du contexte
  const value = useMemo(
    () => ({
      ...state,
      refreshContract
    }),
    [state, refreshContract]
  );

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
