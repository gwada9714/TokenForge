import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getContractAddress } from '../config/contracts';
import { useNetwork } from 'wagmi';

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType>({
  contractAddress: null,
  isLoading: true,
  error: null
});

export const useContract = () => useContext(ContractContext);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const [state, setState] = useState<ContractContextType>({
    contractAddress: null,
    isLoading: true,
    error: null
  });

  const { chain } = useNetwork();

  useEffect(() => {
    const loadContract = async () => {
      console.log('Loading contract...', { chain });
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        if (!chain) {
          console.warn('No chain detected');
          setState(prev => ({
            ...prev,
            contractAddress: null,
            error: "Réseau non détecté. Veuillez vous connecter à Sepolia.",
            isLoading: false
          }));
          return;
        }

        console.log('Getting contract address for chain:', chain.id);
        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        console.log('Contract address:', address);
        
        if (!address || address === '0x0000000000000000000000000000000000000000') {
          console.error('Invalid contract address');
          setState({
            contractAddress: null,
            error: `Adresse du contrat invalide pour le réseau ${chain.name}`,
            isLoading: false
          });
          return;
        }

        setState({
          contractAddress: address as `0x${string}`,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading contract:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "Erreur lors du chargement du contrat",
          isLoading: false
        }));
      }
    };

    loadContract();
  }, [chain]);

  return (
    <ContractContext.Provider value={state}>
      {children}
    </ContractContext.Provider>
  );
};
