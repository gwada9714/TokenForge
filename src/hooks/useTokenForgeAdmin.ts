import { useEffect, useMemo, useReducer, useState } from 'react';
import { useAccount, useNetwork, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import type { Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { CONTRACT_ADDRESSES } from '../constants/addresses';
import { useContract } from '../contexts/ContractContext';
import { adminReducer, initialState } from '../reducers/adminReducer';
import type { TokenForgeAdminHookReturn, NetworkStatus } from '../types/hooks';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [isOwner, setIsOwner] = useState(false);
  const [transactionState, setTransactionState] = useState({
    isPausing: false,
    isUnpausing: false,
    isTransferring: false,
  });
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);
  const [newOwnerAddress, setNewOwnerAddress] = useState<Address>();

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

    return configAddress;
  }, [chain?.id, contextContractAddress]);

  // Lecture du statut de pause
  const { 
    data: isPaused,
    isLoading: isLoadingPaused,
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    chainId: chain?.id,
    watch: true,
    cacheTime: 2000,
    staleTime: 1000,
    enabled: !!contractAddress && !!chain?.id,
    onError: (error) => {
      console.error('Error fetching pause status:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la lecture du statut de pause' });
    }
  });

  // Lecture du propriétaire
  const { 
    data: owner,
    isLoading: isLoadingOwner,
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    chainId: chain?.id,
    watch: true,
    cacheTime: 5000,
    staleTime: 2000,
    enabled: !!contractAddress && !!chain?.id,
    onError: (error) => {
      console.error('Error fetching owner:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la lecture du propriétaire' });
    }
  });

  // Vérification du propriétaire
  useEffect(() => {
    if (!address || !owner) return;

    const ownerStatus = address.toLowerCase() === owner.toLowerCase();
    setIsOwner(ownerStatus);

    if (!ownerStatus) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Vous devez être le propriétaire du contrat pour accéder au dashboard' 
      });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [address, owner]);

  // État du réseau
  const networkStatus: NetworkStatus = useMemo(() => {
    if (!chain) {
      return {
        isConnected: false,
        isCorrectNetwork: false,
        requiredNetwork: 'Sepolia',
        error: 'Aucun réseau détecté'
      };
    }

    const isCorrectNetwork = chain.id === 11155111;
    return {
      isConnected: true,
      isCorrectNetwork,
      requiredNetwork: 'Sepolia',
      networkName: chain.name,
      error: !isCorrectNetwork ? 'Veuillez vous connecter au réseau Sepolia' : undefined
    };
  }, [chain]);

  // Attente de la transaction
  const { isLoading: isWaitingTx } = useWaitForTransaction({
    hash: pendingTx,
    onSuccess: () => {
      setPendingTx(undefined);
      dispatch({ type: 'SET_ERROR', payload: null });
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
      setPendingTx(undefined);
      dispatch({ type: 'SET_ERROR', payload: 'La transaction a échoué' });
    }
  });

  // Configuration des transactions
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'setPaused',
    args: [true],
    enabled: !!contractAddress && isOwner && !isPaused,
  });

  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'setPaused',
    args: [false],
    enabled: !!contractAddress && isOwner && isPaused,
  });

  const { writeAsync: pauseAsync } = useContractWrite(pauseConfig);
  const { writeAsync: unpauseAsync } = useContractWrite(unpauseConfig);

  // Fonctions de transaction
  const pauseContract = async () => {
    if (!contractAddress || !address || !pauseAsync) return;
    setTransactionState(prev => ({ ...prev, isPausing: true }));
    try {
      const result = await pauseAsync();
      setPendingTx(result.hash);
    } catch (error) {
      console.error('Error pausing contract:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la mise en pause du contrat' });
    } finally {
      setTransactionState(prev => ({ ...prev, isPausing: false }));
    }
  };

  const unpauseContract = async () => {
    if (!contractAddress || !address || !unpauseAsync) return;
    setTransactionState(prev => ({ ...prev, isUnpausing: true }));
    try {
      const result = await unpauseAsync();
      setPendingTx(result.hash);
    } catch (error) {
      console.error('Error unpausing contract:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la reprise du contrat' });
    } finally {
      setTransactionState(prev => ({ ...prev, isUnpausing: false }));
    }
  };

  // Configuration du transfert de propriété
  useEffect(() => {
    if (newOwnerAddress) {
      setNewOwnerAddress(undefined);
    }
  }, [contractAddress]);

  const { config: transferConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    args: newOwnerAddress ? [newOwnerAddress] : undefined,
    enabled: !!contractAddress && isOwner && !!newOwnerAddress,
  });

  const { writeAsync: transferAsync } = useContractWrite(transferConfig);

  const transferOwnership = async (newOwner: Address) => {
    if (!contractAddress || !address) return;
    setTransactionState(prev => ({ ...prev, isTransferring: true }));
    try {
      setNewOwnerAddress(newOwner);
      if (!transferAsync) {
        throw new Error('Transaction non disponible');
      }
      const result = await transferAsync();
      setPendingTx(result.hash);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du transfert de propriété' });
    } finally {
      setTransactionState(prev => ({ ...prev, isTransferring: false }));
      setNewOwnerAddress(undefined);
    }
  };

  return {
    error: state.error,
    isPaused: isPaused || false,
    isOwner,
    owner: owner || undefined,
    networkStatus,
    isLoading: isLoadingPaused || isLoadingOwner || isWaitingTx,
    pauseContract,
    unpauseContract,
    transferOwnership,
    ...transactionState
  };
};
