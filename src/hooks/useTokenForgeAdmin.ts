import { useAccount, useNetwork, usePublicClient, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactoryABI from '../abi/TokenFactoryABI.json';
import { useContract } from '../contexts/ContractContext';
import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { TOKEN_FORGE_ADDRESS } from '../constants/addresses';
import { useNotifications } from './useNotifications';

// Types
interface NetworkCheckResult {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  requiredNetwork: string;
  networkName?: string;
}

interface ContractCheckResult {
  isValid: boolean;
  isDeployed: boolean;
}

interface WalletCheckResult {
  isConnected: boolean;
  currentAddress?: string;
}

interface AdminAction {
  type: 'SET_ERROR' | 'SET_SUCCESS' | 'SET_LOADING' | 'SET_PAUSING' | 'SET_UNPAUSING' | 'SET_TRANSFERRING' | 'SET_NETWORK_CHECK' | 'SET_CONTRACT_CHECK' | 'SET_WALLET_CHECK' | 'SET_LAST_ACTIVITY';
  payload: any;
}

export interface TokenForgeAdminState {
  error: string | null;
  successMessage: string | null;
  isLoading: boolean;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  lastActivity: Date | null;
}

interface TokenForgeAdminHookReturn extends TokenForgeAdminState {
  error: string | null;
  success: string | null;
  isAdmin: boolean;
  contractAddress: `0x${string}`;
  owner: `0x${string}`;
  paused: boolean;
  pauseAvailable: boolean;
  handlePause: () => Promise<void>;
  handleUnpause: () => Promise<void>;
  handleWithdrawFees: () => Promise<void>;
  handleTransferOwnership: (newOwner: string) => Promise<void>;
  handleRetryCheck: () => boolean;
}

// État initial
const initialState: TokenForgeAdminState = {
  error: null,
  successMessage: null,
  isLoading: false,
  isPausing: false,
  isUnpausing: false,
  isTransferring: false,
  networkCheck: {
    isConnected: false,
    isCorrectNetwork: false,
    requiredNetwork: 'Sepolia'
  },
  contractCheck: {
    isValid: false,
    isDeployed: false
  },
  walletCheck: {
    isConnected: false
  },
  lastActivity: null
};

// Reducer
function adminReducer(state: TokenForgeAdminState, action: AdminAction): TokenForgeAdminState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload, successMessage: null };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PAUSING':
      return { ...state, isPausing: action.payload };
    case 'SET_UNPAUSING':
      return { ...state, isUnpausing: action.payload };
    case 'SET_TRANSFERRING':
      return { ...state, isTransferring: action.payload };
    case 'SET_NETWORK_CHECK':
      return { ...state, networkCheck: action.payload };
    case 'SET_CONTRACT_CHECK':
      return { ...state, contractCheck: action.payload };
    case 'SET_WALLET_CHECK':
      return { ...state, walletCheck: action.payload };
    case 'SET_LAST_ACTIVITY':
      return { ...state, lastActivity: action.payload };
    default:
      return state;
  }
}

// Hook personnalisé pour la gestion des transactions
const useContractTransaction = (contractAddress: `0x${string}` | undefined) => {
  const publicClient = usePublicClient();

  return useCallback(async (
    transaction: () => Promise<{ hash: string }>,
    options: { onSuccess?: string; onError?: string } = {}
  ) => {
    try {
      const tx = await transaction();
      const hash = tx.hash as `0x${string}`;
      await publicClient.waitForTransactionReceipt({ hash });
      return { success: true, message: options.onSuccess };
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error(options.onError || 'Transaction failed');
    }
  }, [publicClient]);
}

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress: contextContractAddress } = useContract();
  const { setError, setSuccess, error, success } = useNotifications();

  // Vérification et initialisation de l'adresse du contrat
  const contractAddress = useMemo(() => {
    const address = contextContractAddress || TOKEN_FORGE_ADDRESS;
    // Vérifier que l'adresse commence par '0x' et a la bonne longueur
    if (typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      return address as `0x${string}`;
    }
    throw new Error('Invalid contract address format');
  }, [contextContractAddress]);

  // Contract reads avec gestion d'erreur et enabled
  const {
    data: ownerData,
    isLoading: isOwnerLoading
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: Boolean(contractAddress) && isConnected && state.networkCheck.isCorrectNetwork
  });

  const {
    data: pausedData,
    isLoading: isPausedLoading
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: Boolean(contractAddress) && isConnected && state.networkCheck.isCorrectNetwork
  });

  // Contract writes
  const { writeAsync: writePause } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause'
  });

  const { writeAsync: writeUnpause } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause'
  });

  const { writeAsync: writeWithdrawFees } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'withdrawFees'
  });

  const { writeAsync: writeTransferOwnership } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership'
  });

  // Vérifications
  const isAdmin = useMemo(() => {
    if (!address || !ownerData || !isConnected || !state.networkCheck.isCorrectNetwork) {
      return false;
    }
    return address.toLowerCase() === (ownerData as string).toLowerCase();
  }, [address, ownerData, isConnected, state.networkCheck.isCorrectNetwork]);

  const checkBaseRequirements = useCallback(() => {
    if (!contractAddress || !isConnected || !state.networkCheck.isCorrectNetwork) {
      throw new TokenForgeError(
        'Vérifiez votre connexion et le réseau',
        TokenForgeErrorCode.NOT_CONNECTED
      );
    }
    if (!address) {
      throw new TokenForgeError(
        'Wallet non connecté',
        TokenForgeErrorCode.WALLET_NOT_CONNECTED
      );
    }
    return true;
  }, [contractAddress, isConnected, state.networkCheck.isCorrectNetwork, address]);

  // Gestionnaire d'erreurs centralisé
  const handleContractTransaction = useCallback(async (
    transaction: () => Promise<any>,
    successMessage: string
  ) => {
    try {
      setError(null);
      const result = await transaction();
      setSuccess(successMessage);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    }
  }, [setError, setSuccess]);

  // Actions administrateur
  const handlePause = async () => {
    if (!writePause) return;
    dispatch({ type: 'SET_PAUSING', payload: true });
    try {
      await handleContractTransaction(
        () => writePause(),
        'Le contrat a été mis en pause avec succès'
      );
    } catch (error) {
      console.error('Erreur lors de la mise en pause du contrat:', error);
    } finally {
      dispatch({ type: 'SET_PAUSING', payload: false });
    }
  };

  const handleUnpause = async () => {
    if (!writeUnpause) return;
    dispatch({ type: 'SET_UNPAUSING', payload: true });
    try {
      await handleContractTransaction(
        () => writeUnpause(),
        'Le contrat a été réactivé avec succès'
      );
    } catch (error) {
      console.error('Erreur lors de la réactivation du contrat:', error);
    } finally {
      dispatch({ type: 'SET_UNPAUSING', payload: false });
    }
  };

  const handleWithdrawFees = async () => {
    if (!writeWithdrawFees) return;
    try {
      await handleContractTransaction(
        () => writeWithdrawFees(),
        'Les frais ont été retirés avec succès'
      );
    } catch (error) {
      console.error('Erreur lors du retrait des frais:', error);
    }
  };

  const handleTransferOwnership = async (newOwner: string) => {
    if (!writeTransferOwnership) return;
    dispatch({ type: 'SET_TRANSFERRING', payload: true });
    try {
      await handleContractTransaction(
        () => writeTransferOwnership({ args: [newOwner as Address] }),
        'La propriété a été transférée avec succès'
      );
    } catch (error) {
      console.error('Erreur lors du transfert de propriété:', error);
    } finally {
      dispatch({ type: 'SET_TRANSFERRING', payload: false });
    }
  };

  // Effets
  useEffect(() => {
    dispatch({
      type: 'SET_NETWORK_CHECK',
      payload: {
        isConnected: !!isConnected,
        isCorrectNetwork: chain?.id === 11155111,
        requiredNetwork: 'Sepolia',
        networkName: chain?.name
      }
    });
  }, [chain, isConnected]);

  useEffect(() => {
    dispatch({
      type: 'SET_WALLET_CHECK',
      payload: {
        isConnected: !!isConnected,
        currentAddress: address
      }
    });
  }, [isConnected, address]);

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isOwnerLoading || isPausedLoading
    });
  }, [isOwnerLoading, isPausedLoading]);

  // Retourner l'interface publique
  return {
    ...state,
    error,
    success,
    isAdmin,
    contractAddress,
    owner: ownerData as `0x${string}`,
    paused: pausedData as boolean,
    pauseAvailable: !state.isPausing && !state.isUnpausing,
    handlePause,
    handleUnpause,
    handleWithdrawFees,
    handleTransferOwnership,
    handleRetryCheck: checkBaseRequirements
  };
}
