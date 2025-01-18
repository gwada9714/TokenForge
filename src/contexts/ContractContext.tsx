import { createContext, useContext, ReactNode } from 'react';

interface ContractContextType {
  contractAddress?: string;
  error?: string;
}

const ContractContext = createContext<ContractContextType>({
  contractAddress: undefined,
  error: undefined
});

export const useContract = () => useContext(ContractContext);

interface ContractProviderProps {
  children: ReactNode;
  contractAddress?: string;
}

export const ContractProvider = ({ children, contractAddress }: ContractProviderProps) => {
  return (
    <ContractContext.Provider value={{ contractAddress }}>
      {children}
    </ContractContext.Provider>
  );
};
