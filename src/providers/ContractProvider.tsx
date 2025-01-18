import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { CircularProgress, Box, Alert } from '@mui/material';

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
      try {
        setIsLoading(true);
        console.log('Loading contract address:', {
          chain,
          isConnected,
          currentState: { contractAddress, isLoading, error }
        });

        // Si pas connecté, on affiche un message
        if (!isConnected) {
          setError("Veuillez connecter votre wallet");
          setContractAddress(null);
          return;
        }

        // Si pas de chaîne, on affiche un message
        if (!chain) {
          setError("Réseau non détecté");
          setContractAddress(null);
          return;
        }

        // Vérification du réseau Sepolia
        if (chain.id !== 11155111) {
          setError(`Veuillez vous connecter au réseau Sepolia. Réseau actuel : ${chain.name}`);
          setContractAddress(null);
          return;
        }

        try {
          const address = getContractAddress('TOKEN_FACTORY', chain.id);
          console.log('Contract configuration:', {
            chainId: chain.id,
            address,
            rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
            deploymentOwner: import.meta.env.VITE_DEPLOYMENT_OWNER
          });

          if (!address) {
            setError('Adresse du contrat non définie');
            setContractAddress(null);
            return;
          }

          // Vérifie si l'adresse est valide
          if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            setError('Format d\'adresse du contrat invalide');
            setContractAddress(null);
            return;
          }

          setContractAddress(address);
          setError(null);
        } catch (err) {
          console.error('Erreur lors du chargement du contrat:', err);
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement du contrat');
          setContractAddress(null);
        } finally {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading contract address:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'adresse du contrat');
        setContractAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContractAddress();
  }, [chain, isConnected]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ContractContext.Provider value={{ contractAddress, isLoading, error }}>
      {error ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {children}
        </Box>
      ) : (
        children
      )}
    </ContractContext.Provider>
  );
};
