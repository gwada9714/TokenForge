import { useMemo, useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useTransaction } from 'wagmi';
import { type Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { useContract } from '../contexts/ContractContext';
import type { TokenForgeAdminHookReturn } from '../types/hooks';
import { toast } from 'react-hot-toast';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const { address } = useAccount();
  const { contractAddress, networkStatus: contractNetworkStatus } = useContract();
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lecture du propriétaire du contrat
  const { data: ownerAddress, isLoading: ownerLoading } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    query: {
      enabled: !!contractAddress && contractNetworkStatus.isConnected,
    }
  });

  // Lecture de l'état de pause
  const { data: isPaused = false } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    query: {
      enabled: !!contractAddress && contractNetworkStatus.isConnected,
    }
  });

  // Écriture pour la pause
  const { writeContract: pauseContract } = useContractWrite();
  const { writeContract: unpauseContract } = useContractWrite();
  const { writeContract: transferContract } = useContractWrite();
  const { waitForTransaction } = useTransaction();

  // Gestion de la pause
  const handleTogglePause = async () => {
    if (!contractAddress) return;

    try {
      setIsProcessing(true);
      if (isPaused) {
        setIsUnpausing(true);
        const { hash } = await unpauseContract({
          abi: TokenForgeFactoryABI.abi,
          address: contractAddress as Address,
          functionName: 'unpause',
        });
        await waitForTransaction({ hash });
        setIsUnpausing(false);
      } else {
        setIsPausing(true);
        const { hash } = await pauseContract({
          abi: TokenForgeFactoryABI.abi,
          address: contractAddress as Address,
          functionName: 'pause',
        });
        await waitForTransaction({ hash });
        setIsPausing(false);
      }
      toast.success(isPaused ? 'Contract unpaused' : 'Contract paused');
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast.error('Failed to toggle pause state');
    } finally {
      setIsProcessing(false);
      setIsPausing(false);
      setIsUnpausing(false);
    }
  };

  // Transfert de propriété
  const transferOwnership = async (newOwner: Address) => {
    if (!contractAddress) return;

    try {
      setIsTransferring(true);
      const { hash } = await transferContract({
        abi: TokenForgeFactoryABI.abi,
        address: contractAddress as Address,
        functionName: 'transferOwnership',
        args: [newOwner],
      });
      await waitForTransaction({ hash });
      toast.success('Ownership transferred successfully');
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Failed to transfer ownership');
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    error: null,
    isPaused,
    isOwner: ownerAddress === address,
    owner: ownerAddress as Address | undefined,
    networkStatus: contractNetworkStatus,
    isLoading: ownerLoading || isPausing || isUnpausing || isTransferring || isProcessing,
    transferOwnership,
    isTransferring,
    isPausing,
    isUnpausing,
    isProcessing,
    handleTogglePause,
    contractAddress: contractAddress as Address | undefined,
    contract: contractAddress ? {
      address: contractAddress as Address,
      abi: TokenForgeFactoryABI.abi,
    } : undefined,
  };
};
