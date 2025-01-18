import { useAccount, useNetwork, usePublicClient, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactoryABI from '../abi/TokenFactoryABI.json';
import { useContract } from '../contexts/ContractContext';
import { useReducer, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TOKEN_FORGE_ADDRESS } from '../constants/addresses';
import { useNotifications } from './useNotifications';
import { debounce } from '../utils/helpers';

// Types
interface NetworkCheckResult {
  readonly isConnected: boolean;
  readonly isCorrectNetwork: boolean;
  readonly requiredNetwork: string;
  readonly networkName?: string;
}

interface ContractCheckResult {
  readonly isValid: boolean;
  readonly isDeployed: boolean;
  readonly error?: string;
}

interface WalletCheckResult {
  readonly isConnected: boolean;
  readonly currentAddress?: string;
}

type AdminAction =
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NETWORK_CHECK'; payload: NetworkCheckResult }
  | { type: 'SET_CONTRACT_CHECK'; payload: ContractCheckResult }
  | { type: 'SET_WALLET_CHECK'; payload: WalletCheckResult }
  | { type: 'SET_LAST_ACTIVITY'; payload: Date | null };

interface TokenForgeAdminState {
  error: string | null;
  successMessage: string | null;
  isLoading: boolean;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  lastActivity: Date | null;
}

interface TokenForgeAdminHookReturn {
  error: string | null;
  success: string | null;
  isAdmin: boolean;
  contractAddress: Address;
  owner: Address | undefined;
  isProcessing: boolean;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  lastActivity: Date | null;
  handleRetryCheck: () => void;
  isLoading: boolean;
  isPaused: boolean;
  handleTransferOwnership: (newOwner: string) => Promise<void>;
  handleTogglePause: () => Promise<void>;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  setNewOwnerAddress: (address: string) => void;
  pauseAvailable: boolean;
  contract: any; // Ajout pour AlertsManagement et AuditLogs
}

const REQUIRED_NETWORK_ID = 11155111; // Sepolia network ID
const DEBUG_PREFIX = '🔍 [AdminDebug]';
const DEBUG_SEPARATOR = '------------------------';

const initialState: TokenForgeAdminState = {
  error: null,
  successMessage: null,
  isLoading: true,
  networkCheck: {
    isConnected: false,
    isCorrectNetwork: false,
    requiredNetwork: 'Sepolia',
  },
  contractCheck: {
    isValid: false,
    isDeployed: false,
  },
  walletCheck: {
    isConnected: false,
  },
  lastActivity: null,
};

function adminReducer(state: TokenForgeAdminState, action: AdminAction): TokenForgeAdminState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress: contextContractAddress } = useContract();
  const { setError, setSuccess } = useNotifications();
  const publicClient = usePublicClient();

  // Refs optimisés avec types
  const prevAddress = useRef<Address>();
  const prevChainId = useRef<number>();
  const mountedRef = useRef<boolean>(true);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debug Wallet Connection
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Wallet Status:
${DEBUG_SEPARATOR}
🔑 Address: ${address || 'Not Connected'}
🔌 Connected: ${isConnected}
🌐 Network ID: ${chain?.id || 'Unknown'}
🎯 Required Network: ${REQUIRED_NETWORK_ID} (Sepolia)
${DEBUG_SEPARATOR}`);
  }, [address, isConnected, chain?.id]);

  // Optimisation du contract address avec validation et cache
  const contractAddress = useMemo(() => {
    const validateAddress = (address: string): address is Address => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    };

    try {
      const addr = contextContractAddress || TOKEN_FORGE_ADDRESS;
      
      // Debug Contract Address
      console.log(`${DEBUG_PREFIX} Contract Check:
${DEBUG_SEPARATOR}
📝 Context Address: ${contextContractAddress || 'Not Set'}
🔄 Fallback Address: ${TOKEN_FORGE_ADDRESS}
✅ Final Address: ${addr}
${DEBUG_SEPARATOR}`);

      if (!validateAddress(addr)) {
        throw new TokenForgeError("Adresse de contrat invalide", TokenForgeErrorCode.INVALID_ADDRESS);
      }
      return addr;
    } catch (error) {
      console.error('Contract address validation error:', error);
      return TOKEN_FORGE_ADDRESS;
    }
  }, [contextContractAddress]);

  // Lecture du propriétaire du contrat
  const { data: owner } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
  }) as { data: Address | undefined };

  // Vérification du réseau
  const checkNetwork = useCallback(() => {
    const networkCheck: NetworkCheckResult = {
      isConnected: isConnected,
      isCorrectNetwork: chain?.id === REQUIRED_NETWORK_ID,
      requiredNetwork: 'Sepolia',
      networkName: chain?.name || undefined,
    };

    dispatch({ type: 'SET_NETWORK_CHECK', payload: networkCheck });
    return networkCheck;
  }, [chain?.id, chain?.name, isConnected]);

  // Vérification du contrat
  const checkContract = useCallback(async () => {
    try {
      const code = await publicClient.getBytecode({ address: contractAddress });
      const isDeployed = code !== undefined && code !== '0x';
      
      const contractCheck: ContractCheckResult = {
        isValid: true,
        isDeployed,
      };

      dispatch({ type: 'SET_CONTRACT_CHECK', payload: contractCheck });
      return contractCheck;
    } catch (error) {
      console.error('Contract check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la vérification du contrat';
      const contractCheck: ContractCheckResult = {
        isValid: false,
        isDeployed: false,
        error: errorMessage,
      };
      dispatch({ type: 'SET_CONTRACT_CHECK', payload: contractCheck });
      return contractCheck;
    }
  }, [contractAddress, publicClient]);

  // Vérification du wallet
  const checkWallet = useCallback(() => {
    const walletCheck: WalletCheckResult = {
      isConnected,
      currentAddress: address,
    };

    dispatch({ type: 'SET_WALLET_CHECK', payload: walletCheck });
    return walletCheck;
  }, [address, isConnected]);

  // Fonction de vérification complète
  const performChecks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const networkResult = checkNetwork();
      const contractResult = await checkContract();
      const walletResult = checkWallet();

      // Vérification des conditions d'accès admin
      if (!networkResult.isCorrectNetwork) {
        throw new TokenForgeError("Mauvais réseau. Veuillez vous connecter à Sepolia.", TokenForgeErrorCode.WRONG_NETWORK);
      }

      if (!contractResult.isDeployed) {
        throw new TokenForgeError("Le contrat n'est pas déployé à cette adresse.", TokenForgeErrorCode.CONTRACT_NOT_FOUND);
      }

      if (!walletResult.isConnected) {
        throw new TokenForgeError("Wallet non connecté.", TokenForgeErrorCode.WALLET_NOT_CONNECTED);
      }

      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_LAST_ACTIVITY', payload: new Date() });
    } catch (error) {
      console.error('Admin check error:', error);
      if (error instanceof TokenForgeError) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Une erreur inattendue est survenue' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [checkNetwork, checkContract, checkWallet]);

  // Gestion des changements de wallet/réseau
  useEffect(() => {
    const hasAddressChanged = prevAddress.current !== address;
    const hasChainChanged = prevChainId.current !== chain?.id;

    if (hasAddressChanged || hasChainChanged) {
      prevAddress.current = address;
      prevChainId.current = chain?.id;
      performChecks();
    }
  }, [address, chain?.id, performChecks]);

  // Vérification initiale
  useEffect(() => {
    performChecks();
  }, [performChecks]);

  // Fonction de retry avec debounce
  const handleRetryCheck = useMemo(
    () => debounce(() => {
      if (mountedRef.current) {
        performChecks();
      }
    }, 500),
    [performChecks]
  );

  const isAdmin = useMemo(() => {
    console.log('🔍 [AdminDebug] isAdmin Check:', {
      address,
      owner,
      ownerType: typeof owner,
      addressMatch: address && owner ? address === owner : false,
      networkOk: state.networkCheck.isCorrectNetwork,
      contractOk: state.contractCheck.isValid,
      walletOk: state.walletCheck.isConnected
    });

    if (!address || !owner) return false;

    return Boolean(
      address &&
      owner &&
      address === owner &&
      state.networkCheck.isCorrectNetwork &&
      state.contractCheck.isValid &&
      state.walletCheck.isConnected
    );
  }, [address, owner, state.networkCheck.isCorrectNetwork, state.contractCheck.isValid, state.walletCheck.isConnected]);

  // État local pour les fonctionnalités d'administration
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Lecture de l'état pause
  const { data: paused } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
  }) as { data: boolean };

  // Fonction pause
  const { writeAsync: pauseContract } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause',
  });

  // Fonction unpause
  const { writeAsync: unpauseContract } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause',
  });

  // Fonction transferOwnership
  const { writeAsync: transferOwnershipContract } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
  });

  // Implémentation de pause
  const pause = async () => {
    if (!isAdmin) {
      setError("Vous n'avez pas les droits d'administration");
      return;
    }
    
    try {
      setIsPausing(true);
      await pauseContract();
      setSuccess('Contrat mis en pause avec succès');
    } catch (error) {
      setError('Erreur lors de la mise en pause du contrat');
      console.error('Pause error:', error);
    } finally {
      setIsPausing(false);
    }
  };

  // Implémentation de unpause
  const unpause = async () => {
    if (!isAdmin) {
      setError("Vous n'avez pas les droits d'administration");
      return;
    }
    
    try {
      setIsUnpausing(true);
      await unpauseContract();
      setSuccess('Contrat réactivé avec succès');
    } catch (error) {
      setError('Erreur lors de la réactivation du contrat');
      console.error('Unpause error:', error);
    } finally {
      setIsUnpausing(false);
    }
  };

  // Implémentation de transferOwnership
  const transferOwnership = async (newOwner: string) => {
    if (!isAdmin) {
      setError("Vous n'avez pas les droits d'administration");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newOwner)) {
      setError('Adresse invalide');
      return;
    }
    
    try {
      setIsTransferring(true);
      await transferOwnershipContract({ args: [newOwner] });
      setSuccess('Propriété transférée avec succès');
    } catch (error) {
      setError('Erreur lors du transfert de propriété');
      console.error('Transfer ownership error:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    error: state.error,
    success: state.successMessage,
    isAdmin,
    contractAddress,
    owner,
    isProcessing: state.isLoading,
    networkCheck: state.networkCheck,
    contractCheck: state.contractCheck,
    walletCheck: state.walletCheck,
    lastActivity: state.lastActivity,
    handleRetryCheck,
    isLoading: state.isLoading,
    isPaused: paused || false,
    handleTransferOwnership: transferOwnership,
    handleTogglePause: paused ? unpause : pause,
    isPausing,
    isUnpausing,
    isTransferring,
    pauseAvailable: isAdmin && !state.isLoading,
    contract: TokenForgeFactoryABI.abi, // Ajout pour AlertsManagement et AuditLogs
  };
}
