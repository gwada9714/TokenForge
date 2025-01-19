import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { CircularProgress, Box, Alert, Button } from '@mui/material';
import { sepolia } from 'wagmi/chains';
import { useNetwork } from '../hooks/useNetwork';

interface ContractContextType {
  contractAddress: `0x${string}` | null;
  isLoading: boolean;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  // Fonction pour basculer vers Sepolia
  const switchToSepolia = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
      setError('Failed to switch network. Please try again.');
    }
  };

  useEffect(() => {
    const loadContract = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isConnected) {
          setError('Please connect your wallet');
          return;
        }

        if (!chain) {
          setError('Network not detected');
          return;
        }

        if (chain.id !== sepolia.id) {
          setError('Please switch to Sepolia network');
          return;
        }

        const address = getContractAddress('TOKEN_FACTORY', chain.id);
        setContractAddress(address);
      } catch (err) {
        console.error('Error loading contract:', err);
        setError('Failed to load contract. Please try again.');
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
