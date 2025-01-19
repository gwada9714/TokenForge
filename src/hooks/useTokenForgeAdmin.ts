import { useMemo, useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { type Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { useContract } from '../contexts/ContractContext';
import type { TokenForgeAdminHookReturn, NetworkStatus } from '../types/hooks';
import { toast } from 'react-hot-toast';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const { address } = useAccount();
  const { contractAddress, networkStatus: contextNetworkStatus } = useContract();
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lecture du propriétaire du contrat
  const { data: ownerAddress, isLoading: ownerLoading } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: contextNetworkStatus === 'connected' && !!contractAddress,
  });

  // Lecture de l'état de pause
  const { data: isPaused = false } = useContractRead({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: contextNetworkStatus === 'connected' && !!contractAddress,
  });

  // Configuration des fonctions d'écriture du contrat
  const { write: writePause } = useContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'toggleAlertRule', // Fonction temporaire pour la pause
  });

  const { write: writeUnpause } = useContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'toggleAlertRule', // Fonction temporaire pour l'unpause
  });

  const { write: writeTransferOwnership, data: transferData } = useContractWrite({
    address: contractAddress ?? undefined,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership'
  });

  // Gestion des transactions en attente
  useWaitForTransaction({
    hash: transferData?.hash,
    onSuccess: () => {
      setIsTransferring(false);
      setIsProcessing(false);
      toast.success('Propriété transférée avec succès');
    },
    onError: () => {
      setIsTransferring(false);
      setIsProcessing(false);
      toast.error('Erreur lors du transfert de propriété');
    },
  });

  // Vérification si l'utilisateur connecté est le propriétaire
  const isOwner = useMemo(() => {
    if (!address || !ownerAddress || typeof ownerAddress !== 'string') return false;
    return address.toLowerCase() === ownerAddress.toLowerCase();
  }, [address, ownerAddress]);

  // Construction du statut réseau
  const networkStatus: NetworkStatus = {
    isConnected: contextNetworkStatus === 'connected',
    isCorrectNetwork: contextNetworkStatus === 'connected',
    requiredNetwork: 'Sepolia',
    networkName: 'Sepolia',
  };

  // Fonction de transfert de propriété
  const transferOwnership = async (newOwner: Address) => {
    try {
      setIsTransferring(true);
      setIsProcessing(true);
      await writeTransferOwnership?.({ args: [newOwner] });
    } catch (error) {
      setIsTransferring(false);
      setIsProcessing(false);
      toast.error('Erreur lors du transfert de propriété');
      throw error;
    }
  };

  // Fonction de basculement de l'état de pause
  const handleTogglePause = async () => {
    try {
      setIsProcessing(true);
      if (isPaused) {
        setIsUnpausing(true);
        await writeUnpause?.();
      } else {
        setIsPausing(true);
        await writePause?.();
      }
    } catch (error) {
      setIsPausing(false);
      setIsUnpausing(false);
      setIsProcessing(false);
      toast.error('Erreur lors du changement d\'état du contrat');
      throw error;
    }
  };

  return {
    error: null,
    isPaused: !!isPaused,
    isOwner,
    owner: (ownerAddress as Address) || undefined,
    networkStatus,
    isLoading: ownerLoading,
    transferOwnership,
    isTransferring,
    isPausing,
    isUnpausing,
    isProcessing,
    handleTogglePause,
    contractAddress: contractAddress as Address | undefined,
  };
};
