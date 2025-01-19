import { useMemo } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { type Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { useContract } from '../contexts/ContractContext';
import type { TokenForgeAdminHookReturn, NetworkStatus } from '../types/hooks';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const { address } = useAccount();
  const { contractAddress, networkStatus: contextNetworkStatus } = useContract();

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

  // Vérification si l'utilisateur connecté est le propriétaire
  const isOwner = useMemo(() => {
    if (!address || !ownerAddress || typeof ownerAddress !== 'string') return false;
    return address.toLowerCase() === ownerAddress.toLowerCase();
  }, [address, ownerAddress]);

  // Construction du statut réseau pour la compatibilité avec le type
  const networkStatus: NetworkStatus = {
    isConnected: contextNetworkStatus === 'connected',
    isCorrectNetwork: contextNetworkStatus === 'connected',
    requiredNetwork: 'Sepolia',
    networkName: 'Sepolia',
  };

  // Fonction de transfert de propriété (stub pour compatibilité type)
  const transferOwnership = async (_newOwner: Address) => {
    throw new Error('Fonction non implémentée');
  };

  return {
    error: null,
    isPaused: !!isPaused,
    isOwner,
    owner: (ownerAddress as Address) || undefined,
    networkStatus,
    isLoading: ownerLoading,
    transferOwnership,
    isTransferring: false
  };
};
