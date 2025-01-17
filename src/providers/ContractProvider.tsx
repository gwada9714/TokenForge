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
        console.log('Loading contract address:', {
          chain,
          isConnected,
          currentState: { contractAddress, isLoading, error }
        });

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

        if (chain.id !== 11155111) {
          setError(`Please connect to Sepolia network. Current network: ${chain.name}`);
          setContractAddress(null);
          return;
        }

        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        console.log('Contract configuration:', {
          chainId: chain.id,
          address,
          rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
          deploymentOwner: import.meta.env.VITE_DEPLOYMENT_OWNER
        });

        if (!address) {
          throw new Error('Contract address is undefined');
        }

        // Vérifie si l'adresse est valide
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error('Invalid contract address format');
        }

        setContractAddress(address);
        setError(null);
      } catch (err) {
        console.error('Error loading contract address:', err);
        setError('Failed to load contract address');
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
