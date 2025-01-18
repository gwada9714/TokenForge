import { useAccount, useNetwork, usePublicClient, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import TokenForgeFactoryABI from '../abi/TokenFactoryABI.json';
import { useContract } from '../contexts/ContractContext';
import { useState, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { TOKEN_FORGE_ADDRESS } from '../constants/addresses';
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
  contract: any;
}

const REQUIRED_NETWORK_ID = 11155111; // Sepolia network ID

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

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { contractAddress: contextContractAddress } = useContract();
  const publicClient = usePublicClient();

  // Refs
  const mountedRef = useRef<boolean>(true);
  const prevAddressRef = useRef<Address>();
  const prevChainIdRef = useRef<number>();

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Contrat cible
  const contractAddress = useMemo(() => 
    contextContractAddress || TOKEN_FORGE_ADDRESS,
    [contextContractAddress]
  );

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
      networkName: chain?.name,
    };
    dispatch({ type: 'SET_NETWORK_CHECK', payload: networkCheck });
  }, [chain?.id, chain?.name, isConnected]);

  // Vérification du contrat
  const checkContract = useCallback(async () => {
    if (!contractAddress) {
      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: {
          isValid: false,
          isDeployed: false,
          error: 'Adresse du contrat non définie',
        },
      });
      return;
    }

    try {
      const code = await publicClient.getBytecode({ address: contractAddress });
      const isDeployed = code !== undefined && code !== '0x';
      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: {
          isValid: true,
          isDeployed,
          error: isDeployed ? undefined : 'Contrat non déployé',
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: {
          isValid: false,
          isDeployed: false,
          error: 'Erreur lors de la vérification du contrat',
        },
      });
    }
  }, [contractAddress, publicClient]);

  // Vérification du portefeuille
  const checkWallet = useCallback(() => {
    dispatch({
      type: 'SET_WALLET_CHECK',
      payload: {
        isConnected,
        currentAddress: address,
      },
    });
  }, [address, isConnected]);

  // Fonction principale de vérification
  const performChecks = useCallback(() => {
    checkNetwork();
    checkWallet();
    checkContract();
  }, [checkNetwork, checkWallet, checkContract]);

  // Effet pour les vérifications initiales et les mises à jour
  useEffect(() => {
    const addressChanged = prevAddressRef.current !== address;
    const chainChanged = prevChainIdRef.current !== chain?.id;

    if (addressChanged || chainChanged) {
      prevAddressRef.current = address;
      prevChainIdRef.current = chain?.id;
      performChecks();
    }
  }, [address, chain?.id, performChecks]);

  // Fonction de retry avec debounce
  const handleRetryCheck = useCallback(
    debounce(() => {
      if (mountedRef.current) {
        performChecks();
      }
    }, 500),
    [performChecks]
  );

  // Vérification des droits d'administration
  const isAdmin = useMemo(() => {
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
      dispatch({ type: 'SET_ERROR', payload: "Vous n'avez pas les droits d'administration" });
      return;
    }
    
    try {
      await pauseContract();
      dispatch({ type: 'SET_SUCCESS', payload: 'Contrat mis en pause avec succès' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la mise en pause du contrat' });
      console.error('Pause error:', error);
    }
  };

  // Implémentation de unpause
  const unpause = async () => {
    if (!isAdmin) {
      dispatch({ type: 'SET_ERROR', payload: "Vous n'avez pas les droits d'administration" });
      return;
    }
    
    try {
      await unpauseContract();
      dispatch({ type: 'SET_SUCCESS', payload: 'Contrat réactivé avec succès' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors de la réactivation du contrat' });
      console.error('Unpause error:', error);
    }
  };

  // Implémentation de transferOwnership
  const transferOwnership = async (newOwner: string) => {
    if (!isAdmin) {
      dispatch({ type: 'SET_ERROR', payload: "Vous n'avez pas les droits d'administration" });
      return;
    }

    if (!newOwner || !newOwner.match(/^0x[a-fA-F0-9]{40}$/)) {
      dispatch({ type: 'SET_ERROR', payload: 'Adresse invalide' });
      return;
    }
    
    try {
      await transferOwnershipContract({ args: [newOwnerAddress] });
      dispatch({ type: 'SET_SUCCESS', payload: 'Propriété transférée avec succès' });
      setNewOwnerAddress(''); // Reset après succès
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du transfert de propriété' });
      console.error('Transfer ownership error:', error);
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
    isPausing: false,
    isUnpausing: false,
    isTransferring: false,
    setNewOwnerAddress,
    pauseAvailable: isAdmin && !state.isLoading,
    contract: TokenForgeFactoryABI.abi,
  };
}
