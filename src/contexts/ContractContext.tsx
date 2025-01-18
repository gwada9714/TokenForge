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
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        if (!chain) {
          setState(prev => ({
            ...prev,
            contractAddress: null,
            error: "Réseau non détecté",
            isLoading: false
          }));
          return;
        }

        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        
        setState({
          contractAddress: address,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur lors du chargement du contrat:', error);
        setState({
          contractAddress: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Erreur lors du chargement du contrat"
        });
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
