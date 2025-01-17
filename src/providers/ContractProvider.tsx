import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { CircularProgress, Box } from '@mui/material';

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
  error: string | null;
}

const ContractContext = createContext<ContractContextType>({
  contractAddress: null,
  isLoading: true,
  error: null,
});

export const useContract = () => useContext(ContractContext);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContractAddress = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!chain) {
          setError('Please connect to a network');
          setContractAddress(null);
          return;
        }

        if (!isConnected) {
          setError('Please connect your wallet');
          setContractAddress(null);
          return;
        }

        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        console.log('Contract address loaded:', {
          chainId: chain.id,
          chainName: chain.name,
          address,
          isConnected
        });

        if (!address || address === '0x0000000000000000000000000000000000000000') {
          setError(`Contract not deployed on ${chain.name}`);
          setContractAddress(null);
          return;
        }

        setContractAddress(address as `0x${string}`);
        setError(null);
      } catch (error) {
        console.error('Error loading contract address:', error);
        setError(error instanceof Error ? error.message : 'Failed to load contract address');
        setContractAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContractAddress();
  }, [chain, isConnected]);

  // Afficher un indicateur de chargement pendant l'initialisation
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ContractContext.Provider value={{ contractAddress, isLoading, error }}>
      {children}
    </ContractContext.Provider>
  );
};
