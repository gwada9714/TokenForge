import { useEffect, useMemo, useReducer, useState } from 'react';
import { useAccount, useNetwork, usePublicClient, useContractRead } from 'wagmi';
import { getContract, type Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { CONTRACT_ADDRESSES } from '../constants/addresses';
import { useContract } from '../contexts/ContractContext';
import { adminReducer, initialState } from '../reducers/adminReducer';
import type { TokenForgeAdminHookReturn, NetworkStatus } from '../types/hooks';

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
    if (!chain?.id) {
      console.warn('No chain ID available');
      return undefined;
    }

    const addressFromContext = contextContractAddress;
    const addressFromConfig = CONTRACT_ADDRESSES[chain.id]?.tokenForge;

    console.log('Contract address resolution:', {
      chainId: chain.id,
      contextAddress: addressFromContext,
      configAddress: addressFromConfig,
      final: addressFromContext || addressFromConfig
    });

    return (addressFromContext || addressFromConfig) as Address | undefined;
  }, [contextContractAddress, chain?.id]);

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
    onSuccess: (data) => {
      console.log('Paused status:', { 
        isPaused: data,
        contractAddress,
        chainId: chain?.id,
      });
    },
    onError: (error) => {
      console.error('Error fetching pause status:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
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
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  });

  // État du réseau
  const networkStatus: NetworkStatus = useMemo(() => {
    if (!chain) {
      return {
        isConnected: false,
        isCorrectNetwork: false,
        requiredNetwork: 'Sepolia',
        error: 'Veuillez connecter votre wallet',
      };
    }

    const networkConfig = CONTRACT_ADDRESSES[chain.id];
    const isCorrectNetwork = !!networkConfig;

    return {
      isConnected: true,
      isCorrectNetwork,
      requiredNetwork: 'Sepolia',
      networkName: chain.name,
      error: !isCorrectNetwork ? 'Veuillez vous connecter au réseau Sepolia' : undefined,
    };
  }, [chain]);

  // Vérification du réseau et du wallet
  useEffect(() => {
    const networkCheck = chain?.id && CONTRACT_ADDRESSES[chain.id] 
      ? { isValid: true, message: '' }
      : { isValid: false, message: 'Réseau non supporté' };

    const walletCheck = address
      ? { isValid: true, message: '' }
      : { isValid: false, message: 'Wallet non connecté' };

    dispatch({ type: 'SET_CHECKS', payload: { networkCheck, walletCheck } });
  }, [chain?.id, address]);

  // Fonctions d'interaction avec le contrat
  const pauseContract = async () => {
    if (!contractAddress || !address) return;

    try {
      setTransactionState(prev => ({ ...prev, isPausing: true }));
      const contract = getContract({
        address: contractAddress,
        abi: TokenForgeFactoryABI.abi,
        publicClient,
      });

      console.log('Pausing contract:', {
        contract,
        address: contractAddress,
        caller: address
      });

      setTransactionState(prev => ({ ...prev, isPausing: false }));
    } catch (error) {
      console.error('Error pausing contract:', error);
      setTransactionState(prev => ({ ...prev, isPausing: false }));
      throw error;
    }
  };

  const unpauseContract = async () => {
    if (!contractAddress || !address) return;

    try {
      setTransactionState(prev => ({ ...prev, isUnpausing: true }));
      const contract = getContract({
        address: contractAddress,
        abi: TokenForgeFactoryABI.abi,
        publicClient,
      });

      console.log('Unpausing contract:', {
        contract,
        address: contractAddress,
        caller: address
      });

      setTransactionState(prev => ({ ...prev, isUnpausing: false }));
    } catch (error) {
      console.error('Error unpausing contract:', error);
      setTransactionState(prev => ({ ...prev, isUnpausing: false }));
      throw error;
    }
  };

  const transferOwnership = async (newOwner: Address) => {
    if (!contractAddress || !address) return;

    try {
      setTransactionState(prev => ({ ...prev, isTransferring: true }));
      const contract = getContract({
        address: contractAddress,
        abi: TokenForgeFactoryABI.abi,
        publicClient,
      });

      console.log('Transferring ownership:', {
        contract,
        currentOwner: address,
        newOwner,
        contractAddress
      });

      setTransactionState(prev => ({ ...prev, isTransferring: false }));
    } catch (error) {
      console.error('Error transferring ownership:', error);
      setTransactionState(prev => ({ ...prev, isTransferring: false }));
      throw error;
    }
  };

  return {
    error: state.error,
    isPaused: isPaused || false,
    isOwner: address?.toLowerCase() === owner?.toLowerCase(),
    owner,
    networkStatus,
    isLoading: isLoadingPaused || isLoadingOwner,
    pauseContract,
    unpauseContract,
    transferOwnership,
    ...transactionState,
  };
};
