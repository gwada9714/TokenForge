import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { getContractAddress } from '../config/contracts';
import { CircularProgress, Box, Alert, Button } from '@mui/material';
import { sepolia } from 'wagmi/chains';

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
  const { switchNetwork } = useSwitchNetwork();
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour basculer vers Sepolia
  const switchToSepolia = async () => {
    try {
      if (switchNetwork) {
        await switchNetwork(sepolia.id);
      }
    } catch (err) {
      console.error('Erreur lors du changement de réseau:', err);
      setError('Impossible de changer de réseau. Veuillez le faire manuellement.');
    }
  };

  useEffect(() => {
    const loadContractAddress = async () => {
      try {
        setIsLoading(true);
        setError(null);

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
        if (chain.id !== sepolia.id) {
          setError(`Veuillez vous connecter au réseau Sepolia`);
          setContractAddress(null);
          return;
        }

        try {
          const address = getContractAddress('TOKEN_FACTORY', chain.id);
          console.log('Contract configuration:', {
            chainId: chain.id,
            address,
            chainName: chain.name,
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
            chain?.id !== sepolia.id && switchNetwork ? (
              <Button color="inherit" size="small" onClick={switchToSepolia}>
                Changer pour Sepolia
              </Button>
            ) : undefined
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
