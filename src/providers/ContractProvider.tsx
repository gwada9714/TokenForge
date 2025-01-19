import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { CircularProgress, Box, Alert, Button } from '@mui/material';
import { sepolia } from 'wagmi/chains';
import { useNetwork } from '../hooks/useNetwork';

// Types spécifiques pour la gestion des erreurs
type ContractError = 
  | 'WALLET_DISCONNECTED'
  | 'NETWORK_NOT_DETECTED'
  | 'WRONG_NETWORK'
  | 'CONTRACT_LOAD_ERROR'
  | 'NETWORK_SWITCH_ERROR';

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
  error: ContractError | null;
  switchToSepolia?: () => Promise<void>;
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
  const { switchChain } = useSwitchChain();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ContractError | null>(null);

  // Fonction pour basculer vers Sepolia
  const switchToSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
      setError('NETWORK_SWITCH_ERROR');
    }
  };

  useEffect(() => {
    const loadContract = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isConnected) {
          setError('WALLET_DISCONNECTED');
          return;
        }

        if (!chain) {
          setError('NETWORK_NOT_DETECTED');
          return;
        }

        if (chain.id !== sepolia.id) {
          setError('WRONG_NETWORK');
          return;
        }

        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        if (!address || !address.startsWith('0x')) {
          throw new Error('Invalid contract address format');
        }
        setContractAddress(address as `0x${string}`);
      } catch (err) {
        console.error('Error loading contract:', err);
        setError('CONTRACT_LOAD_ERROR');
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [chain, isConnected]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert
          severity="error"
          action={
            chain?.id !== sepolia.id && (
              <Button color="inherit" size="small" onClick={switchToSepolia}>
                Switch to Sepolia
              </Button>
            )
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <ContractContext.Provider value={{ contractAddress, isLoading, error, switchToSepolia }}>
      {children}
    </ContractContext.Provider>
  );
};
