import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useState, useEffect } from 'react';
import TokenForgeFactoryABI from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';

export const useTokenForgeAdmin = () => {
  const { address } = useAccount();
  const { contractAddress, isLoading: contractLoading } = useContract();
  const [newOwnerAddress, setNewOwnerAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Lecture du propriétaire du contrat
  const { data: owner, isSuccess: ownerLoaded, isError: ownerError } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    watch: true,
    enabled: !!contractAddress,
  }) as { data: string; isSuccess: boolean; isError: boolean };

  // Lecture de l'état de pause
  const { data: paused, isError: pausedError } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    watch: true,
    enabled: !!contractAddress,
  }) as { data: boolean; isError: boolean };

  // Gestion des erreurs
  useEffect(() => {
    if (contractLoading) {
      setError('Chargement du contrat...');
    } else if (!contractAddress) {
      setError('Adresse du contrat non disponible. Veuillez vérifier votre connexion au réseau.');
    } else if (ownerError) {
      setError('Erreur lors de la lecture du propriétaire du contrat');
    } else if (pausedError) {
      setError('Erreur lors de la lecture de l\'état de pause');
    } else {
      setError(null);
    }
  }, [contractLoading, contractAddress, ownerError, pausedError]);

  // Vérification directe si l'adresse correspond au propriétaire
  const isAdmin = (() => {
    if (!ownerLoaded || !owner || !address || !contractAddress) {
      console.log('useTokenForgeAdmin - État actuel:', JSON.stringify({ 
        ownerLoaded,
        owner: owner || null, 
        address: address || null, 
        contractAddress: contractAddress || null,
        error: error || 'Aucune erreur'
      }, null, 2));
      return false;
    }

    const ownerLower = owner.toLowerCase();
    const addressLower = address.toLowerCase();
    
    const comparisonData = {
      owner: ownerLower,
      currentAddress: addressLower,
      contractAddress,
      isMatch: ownerLower === addressLower,
      error: error || 'Aucune erreur'
    };
    
    console.log('useTokenForgeAdmin - Vérification des adresses:', JSON.stringify(comparisonData, null, 2));
    
    return ownerLower === addressLower;
  })();

  // Préparation de la fonction de transfert de propriété
  const { config: transferConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    args: newOwnerAddress ? [newOwnerAddress] : undefined,
    enabled: !!contractAddress && !!newOwnerAddress,
  });

  // Préparation de la fonction pause
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause',
    enabled: !!contractAddress && !paused,
  });

  // Préparation de la fonction unpause
  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause',
    enabled: !!contractAddress && !!paused,
  });

  // Fonction de transfert de propriété
  const { write: transferOwnership, isLoading: isTransferring } = useContractWrite(transferConfig);

  // Fonction de pause
  const { write: pause, isLoading: isPausing } = useContractWrite(pauseConfig);

  // Fonction de reprise
  const { write: unpause, isLoading: isUnpausing } = useContractWrite(unpauseConfig);

  // Fonction de renonciation à la propriété
  const { config: renounceConfig } = usePrepareContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'renounceOwnership',
    enabled: !!contractAddress,
  });

  const { write: renounceOwnership, isLoading: isRenouncing } = useContractWrite(renounceConfig);

  return {
    isAdmin,
    owner,
    paused,
    transferOwnership,
    renounceOwnership,
    pause,
    unpause,
    isTransferring,
    isRenouncing,
    isPausing,
    isUnpausing,
    setNewOwnerAddress,
    error,
  };
};
