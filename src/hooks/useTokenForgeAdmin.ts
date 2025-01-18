import { useEffect, useMemo, useReducer, useState } from 'react';
import { useAccount, useNetwork, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import type { Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { CONTRACT_ADDRESSES } from '../constants/addresses';
import { useContract } from '../contexts/ContractContext';
import { adminReducer, initialState } from '../reducers/adminReducer';
import type { TokenForgeAdminHookReturn, NetworkStatus } from '../types/hooks';
import type { TokenForgeWriteFunction } from '../types/contracts';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [isOwner, setIsOwner] = useState(false);
  const [transactionState, setTransactionState] = useState({
    isTransferring: false,
  });
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);
  const [targetOwnerAddress, setTargetOwnerAddress] = useState<Address>();

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress: contextContractAddress } = useContract();

  // Résolution de l'adresse du contrat
  const contractAddress = useMemo(() => {
    if (!chain?.id) {
      dispatch({ type: 'SET_ERROR', payload: 'Aucun réseau détecté' });
      return undefined;
    }

    // Priorité à l'adresse du contexte si elle existe
    if (contextContractAddress) {
      return contextContractAddress as Address;
    }

    // Sinon, utiliser l'adresse de la configuration
    const networkConfig = CONTRACT_ADDRESSES[chain.id];
    if (!networkConfig) {
      dispatch({ type: 'SET_ERROR', payload: `Configuration non trouvée pour le réseau ${chain.id}` });
      return undefined;
    }

    const configAddress = networkConfig.tokenForge;
    if (!configAddress || configAddress === '0x0000000000000000000000000000000000000000') {
      dispatch({ type: 'SET_ERROR', payload: `Adresse du contrat invalide pour le réseau ${chain.name}` });
      return undefined;
    }

    return configAddress as Address;
  }, [chain?.id, contextContractAddress]);

  // Lecture de l'état de pause
  const { data: isPausedData } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    watch: true,
  });

  // Lecture du propriétaire
  const { 
    data: ownerData,
    isLoading: isLoadingOwner
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: !!contractAddress,
  });

  // Mise à jour du statut de propriétaire
  useEffect(() => {
    if (ownerData && address) {
      const ownerAddress = ownerData as Address;
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    } else {
      setIsOwner(false);
    }
  }, [ownerData, address]);

  // Configuration du transfert de propriété
  const { config: transferConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership' as TokenForgeWriteFunction,
    args: targetOwnerAddress ? [targetOwnerAddress] : undefined,
    enabled: !!contractAddress && isOwner && !!targetOwnerAddress,
  });

  const { writeAsync: transferAsync } = useContractWrite(transferConfig);

  // Fonction de transfert de propriété
  const transferOwnership = async (newOwnerAddress: Address) => {
    if (!contractAddress || !address) return;
    
    setTransactionState(prev => ({ ...prev, isTransferring: true }));
    setTargetOwnerAddress(newOwnerAddress);

    try {
      if (!transferAsync) throw new Error('Transaction non disponible');
      const result = await transferAsync();
      setPendingTx(result.hash);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du transfert de propriété' });
    } finally {
      setTransactionState(prev => ({ ...prev, isTransferring: false }));
      setTargetOwnerAddress(undefined);
    }
  };

  // Suivi des transactions
  const { isLoading: isWaitingTx } = useWaitForTransaction({
    hash: pendingTx,
    onSuccess: () => {
      setPendingTx(undefined);
      dispatch({ type: 'SET_ERROR', payload: null });
    },
    onError: (error) => {
      console.error('Transaction error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la transaction' });
      setPendingTx(undefined);
    },
  });

  // Construction du statut réseau
  const networkStatus: NetworkStatus = {
    isConnected: !!address,
    isCorrectNetwork: !!chain?.id && !!CONTRACT_ADDRESSES[chain.id],
    requiredNetwork: Object.keys(CONTRACT_ADDRESSES)[0] || '',
    networkName: chain?.name,
    error: state.error || undefined,
  };

  return {
    error: state.error,
    isPaused: !!isPausedData,
    isOwner,
    owner: ownerData as Address | undefined,
    networkStatus,
    isLoading: isLoadingOwner || isWaitingTx,
    transferOwnership,
    isTransferring: transactionState.isTransferring
  };
};
