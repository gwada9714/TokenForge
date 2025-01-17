import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { getContractAddress } from '../config/contracts';

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
}

const ContractContext = createContext<ContractContextType>({
  contractAddress: null,
  isLoading: true,
});

export const useContract = () => useContext(ContractContext);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContractAddress = async () => {
      try {
        if (chain && isConnected) {
          const address = getContractAddress('TOKEN_FACTORY', chain.id);
          console.log('Contract address loaded:', {
            chainId: chain.id,
            chainName: chain.name,
            address,
            isConnected
          });
          setContractAddress(address as `0x${string}`);
        } else {
          console.log('Chain or connection not ready:', {
            chain: chain?.name || 'not selected',
            isConnected
          });
          setContractAddress(null);
        }
      } catch (error) {
        console.error('Error loading contract address:', error);
        setContractAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContractAddress();
  }, [chain, isConnected]);

  return (
    <ContractContext.Provider value={{ contractAddress, isLoading }}>
      {children}
    </ContractContext.Provider>
  );
};
