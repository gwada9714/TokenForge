import { useEffect, useMemo, useReducer, useState } from 'react';
import { useAccount, useNetwork, usePublicClient, useContractRead } from 'wagmi';
import { getContract } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { REQUIRED_NETWORK_ID, TOKEN_FORGE_ADDRESS } from '../constants/addresses';
import { useContract } from '../contexts/ContractContext';
import { adminReducer, initialState } from '../reducers/adminReducer';
import type { TokenForgeAdminHookReturn } from '../types/hooks';

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [transactionState, setTransactionState] = useState({
    isPausing: false,
    isUnpausing: false,
    isTransferring: false,
  });

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress: contextContractAddress } = useContract();
  const publicClient = usePublicClient();

  const contractAddress = useMemo(() => {
    console.log('Contract address setup:', {
      contextContractAddress,
      defaultAddress: TOKEN_FORGE_ADDRESS,
      final: contextContractAddress || TOKEN_FORGE_ADDRESS
    });
    return contextContractAddress || TOKEN_FORGE_ADDRESS;
  }, [contextContractAddress]);

  // Lecture du statut de pause
  const { 
    data: isPaused,
    isLoading: isLoadingPaused,
    error: pausedError,
    refetch: refetchPaused
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    chainId: REQUIRED_NETWORK_ID,
    watch: true,
    cacheTime: 5000,
    staleTime: 2000,
    onSuccess: (data) => {
      console.log('Paused status fetched:', { isPaused: data });
      if (pausedError) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: null 
        });
      }
    },
    onError: (error) => {
      console.error('Error fetching paused status:', {
        error,
        errorMessage: error.message,
        chainId: chain?.id,
        contractAddress
      });
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `Erreur lors de la lecture du statut pause: ${error.message}` 
      });
    },
  });

  // Lecture du propriétaire optimisée
  const { 
    data: ownerData, 
    refetch: refetchOwner,
    isLoading: isLoadingOwner,
    error: ownerError 
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    chainId: REQUIRED_NETWORK_ID,
    watch: true,
    cacheTime: 5000,
    staleTime: 2000,
    onSuccess: (data) => {
      console.log('Owner data fetched:', {
        owner: data,
        currentAddress: address,
        isMatch: address?.toLowerCase() === data?.toLowerCase()
      });
    },
    onError: (error) => {
      console.error('Error fetching owner:', {
        error,
        errorMessage: error.message,
        chainId: chain?.id,
        contractAddress
      });
      setTransactionState({
        isPausing: false,
        isUnpausing: false,
        isTransferring: false
      });
    },
  });

  // Vérification du statut admin
  const isAdmin = useMemo(() => {
    console.log('Admin check details:', {
      address,
      ownerData,
      isLoadingOwner,
      ownerError,
      chainId: chain?.id,
      requiredChainId: REQUIRED_NETWORK_ID,
      contractAddress,
      networkCheck: state.networkCheck,
      walletCheck: state.walletCheck
    });

    if (isLoadingOwner) {
      console.log('Still loading owner data');
      return false;
    }

    if (ownerError) {
      console.error('Owner check error:', ownerError);
      return false;
    }

    if (address && ownerData) {
      const isOwner = address.toLowerCase() === ownerData.toLowerCase();
      console.log('Owner comparison:', {
        currentAddress: address.toLowerCase(),
        ownerAddress: ownerData.toLowerCase(),
        isOwner
      });
      
      if (!state.adminCheckCompleted) {
        dispatch({ type: 'SET_ADMIN_CHECK_COMPLETED', payload: true });
      }
      
      return isOwner;
    }

    console.log('Missing address or owner data');
    return false;
  }, [address, ownerData, isLoadingOwner, ownerError, chain?.id, state.adminCheckCompleted, state.networkCheck, state.walletCheck]);

  // Vérification initiale du réseau
  const networkStatus = useMemo(() => {
    console.log('Network status check:', {
      chain,
      requiredNetwork: REQUIRED_NETWORK_ID,
      isConnected: !!chain,
      isCorrectNetwork: chain?.id === REQUIRED_NETWORK_ID
    });

    if (!chain) {
      return {
        isConnected: false,
        isCorrectNetwork: false,
        requiredNetwork: 'Sepolia',
        error: 'Veuillez connecter votre wallet',
      };
    }

    return {
      isConnected: true,
      isCorrectNetwork: chain.id === REQUIRED_NETWORK_ID,
      requiredNetwork: 'Sepolia',
      networkName: chain.name,
      error: chain.id !== REQUIRED_NETWORK_ID ? 'Veuillez vous connecter au réseau Sepolia' : undefined,
    };
  }, [chain]);

  // Mise à jour du statut réseau
  useEffect(() => {
    dispatch({ type: 'SET_NETWORK_CHECK', payload: networkStatus });
  }, [networkStatus]);

  // Mise à jour du statut wallet
  useEffect(() => {
    console.log('Wallet status update:', {
      address,
      isConnected: !!address
    });

    dispatch({
      type: 'SET_WALLET_CHECK',
      payload: {
        isConnected: !!address,
        currentAddress: address,
      },
    });
  }, [address]);

  // Création du contrat
  const contract = useMemo(() => {
    if (!publicClient || !contractAddress) {
      console.log('Cannot create contract - missing dependencies:', {
        hasPublicClient: !!publicClient,
        contractAddress
      });
      return null;
    }

    console.log('Creating contract instance:', {
      contractAddress,
      chainId: chain?.id
    });

    return getContract({
      address: contractAddress,
      abi: TokenForgeFactoryABI.abi,
      publicClient,
    });
  }, [publicClient, contractAddress, chain?.id]);

  return {
    error: state.error,
    success: state.successMessage,
    isAdmin,
    contractAddress,
    owner: ownerData,
    isProcessing: isLoadingOwner || isLoadingPaused,
    networkCheck: state.networkCheck,
    contractCheck: state.contractCheck,
    walletCheck: state.walletCheck,
    handleTogglePause: async () => {
      setTransactionState(prev => ({ ...prev, isPausing: true }));
      console.warn("handleTogglePause n'est pas encore implémenté");
      setTransactionState(prev => ({ ...prev, isPausing: false }));
    },
    transferOwnership: async () => {
      setTransactionState(prev => ({ ...prev, isTransferring: true }));
      console.warn("transferOwnership n'est pas encore implémenté");
      setTransactionState(prev => ({ ...prev, isTransferring: false }));
    },
    handleTransferOwnership: async () => {
      setTransactionState(prev => ({ ...prev, isTransferring: true }));
      console.warn("handleTransferOwnership n'est pas encore implémenté");
      setTransactionState(prev => ({ ...prev, isTransferring: false }));
    },
    isPaused: isPaused || false,
    isPausing: transactionState.isPausing,
    isUnpausing: transactionState.isUnpausing,
    isTransferring: transactionState.isTransferring,
    pauseAvailable: isAdmin && !isLoadingPaused,
    isLoading: isLoadingOwner || isLoadingPaused,
    handleRetryCheck: async () => {
      console.log('Retrying checks...');
      await Promise.all([refetchOwner(), refetchPaused()]);
    },
    contract,
  };
};
