import { useAccount, useNetwork, usePublicClient, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeFactoryABI } from '../abi/TokenForgeFactory';
import { useContract } from '../contexts/ContractContext';
import { useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { TOKEN_FORGE_ADDRESS } from '../constants/addresses';

// Types
interface NetworkCheckResult {
  readonly isConnected: boolean;
  readonly isCorrectNetwork: boolean;
  readonly requiredNetwork: string;
  readonly networkName?: string;
  readonly error?: string;
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

interface TokenForgeAdminState {
  error: string | null;
  successMessage: string | null;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
}

interface TokenForgeAdminHookReturn {
  error: string | null;
  success: string | null;
  isAdmin: boolean;
  contractAddress: `0x${string}`;
  owner: Address | undefined;
  isProcessing: boolean;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  handleTogglePause: () => Promise<void>;
  transferOwnership: (newOwner: string) => Promise<void>;
  isPaused: boolean;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  pauseAvailable: boolean;
}

// Types d'actions pour le reducer
type AdminAction =
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_NETWORK_CHECK'; payload: NetworkCheckResult }
  | { type: 'SET_CONTRACT_CHECK'; payload: ContractCheckResult }
  | { type: 'SET_WALLET_CHECK'; payload: WalletCheckResult };

const REQUIRED_NETWORK_ID = 11155111; // Sepolia network ID

const initialState: TokenForgeAdminState = {
  error: null,
  successMessage: null,
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
};

function adminReducer(state: TokenForgeAdminState, action: AdminAction): TokenForgeAdminState {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload };
    case 'SET_NETWORK_CHECK':
      return { ...state, networkCheck: action.payload };
    case 'SET_CONTRACT_CHECK':
      return { ...state, contractCheck: action.payload };
    case 'SET_WALLET_CHECK':
      return { ...state, walletCheck: action.payload };
    default:
      return state;
  }
}

export const useTokenForgeAdmin = (): TokenForgeAdminHookReturn => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  const { address } = useAccount();
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

  // Configuration du contrat avec meilleure gestion des erreurs
  const { data: ownerData } = useContractRead({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    chainId: REQUIRED_NETWORK_ID,
    watch: true,
    cacheTime: 5000,
    staleTime: 2000,
    onError: (error) => {
      console.error('Erreur lors de la lecture du propriétaire:', error);
      if (error.message.includes('timeout')) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: "Timeout lors de la connexion à Sepolia. Veuillez vérifier votre connexion réseau et réessayer." 
        });
      } else if (error.message.includes('contract not deployed')) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: "Le contrat n'est pas déployé à l'adresse configurée. Veuillez vérifier la configuration." 
        });
      } else {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Erreur lors de la lecture du propriétaire: ${error.message}` 
        });
      }
    },
  });

  // Vérification plus précise du réseau
  useEffect(() => {
    if (!chain) {
      dispatch({ 
        type: 'SET_NETWORK_CHECK', 
        payload: {
          isConnected: false,
          isCorrectNetwork: false,
          requiredNetwork: 'Sepolia',
          error: 'Veuillez connecter votre wallet'
        }
      });
      return;
    }

    if (chain.id !== REQUIRED_NETWORK_ID) {
      dispatch({
        type: 'SET_NETWORK_CHECK',
        payload: {
          isConnected: true,
          isCorrectNetwork: false,
          requiredNetwork: 'Sepolia',
          networkName: chain.name,
          error: `Veuillez changer de réseau pour Sepolia (Chain ID: ${REQUIRED_NETWORK_ID})`
        }
      });
      return;
    }

    dispatch({
      type: 'SET_NETWORK_CHECK',
      payload: {
        isConnected: true,
        isCorrectNetwork: true,
        requiredNetwork: 'Sepolia',
        networkName: chain.name,
      }
    });
  }, [chain]);

  // Vérification plus précise du wallet
  useEffect(() => {
    dispatch({
      type: 'SET_WALLET_CHECK',
      payload: {
        isConnected: !!address,
        currentAddress: address,
      }
    });
  }, [address]);

  // Vérification du contrat avec meilleure gestion d'erreur
  const checkContract = useCallback(async () => {
    if (!publicClient || !contractAddress) {
      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: { 
          isValid: false, 
          isDeployed: false,
          error: 'Client ou adresse de contrat non disponible' 
        },
      });
      return;
    }

    try {
      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`,
      });

      if (!code || code === '0x') {
        dispatch({
          type: 'SET_CONTRACT_CHECK',
          payload: { 
            isValid: false,
            isDeployed: false,
            error: 'Le contrat n\'existe pas à cette adresse sur Sepolia' 
          },
        });
        return;
      }

      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: { 
          isValid: true,
          isDeployed: true
        },
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du contrat:', error);
      dispatch({
        type: 'SET_CONTRACT_CHECK',
        payload: { 
          isValid: false,
          isDeployed: false,
          error: 'Erreur lors de la vérification du contrat. Veuillez réessayer.' 
        },
      });
    }
  }, [publicClient, contractAddress]);

  // Fonction principale de vérification
  const performChecks = useCallback(() => {
    checkContract();
  }, [checkContract]);

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

  // Vérifier si l'utilisateur est admin
  const isAdmin = useMemo(() => {
    return address?.toLowerCase() === ownerData?.toLowerCase();
  }, [address, ownerData]);

  // Vérifier si le contrat est en pause
  const { data: isPausedData } = useContractRead<typeof TokenForgeFactoryABI.abi, 'paused', boolean>({
    address: TOKEN_FORGE_ADDRESS,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
  });

  // Convertir la donnée en booléen
  const isPaused = Boolean(isPausedData);

  // Vérifier si la fonction de pause est disponible
  const pauseAvailable = useMemo(() => {
    return isAdmin && typeof isPaused === 'boolean';
  }, [isAdmin, isPaused]);

  // Lecture de l'état pause
  const handleTogglePause = async (): Promise<void> => {
    // Cette fonctionnalité n'est pas disponible dans le contrat actuel
    dispatch({ type: 'SET_ERROR', payload: 'La fonction de pause n\'est pas disponible dans ce contrat' });
    return Promise.reject(new Error('Fonction non disponible'));
  };

  // Fonction de transfert de propriété
  const transferOwnership = useCallback(
    async (newOwnerAddress: string) => {
      if (!newOwnerAddress) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Veuillez fournir une adresse valide',
        });
        return;
      }

      const { write } = useContractWrite({
        address: TOKEN_FORGE_ADDRESS,
        abi: TokenForgeFactoryABI.abi,
        functionName: 'transferOwnership',
        args: [newOwnerAddress as `0x${string}`],
        onError: (error) => {
          console.error('Erreur lors du transfert de propriété:', error);
          dispatch({
            type: 'SET_ERROR',
            payload: `Erreur lors du transfert de propriété: ${error.message}`,
          });
        },
        onSuccess: () => {
          dispatch({
            type: 'SET_SUCCESS',
            payload: 'Transfert de propriété effectué avec succès',
          });
        },
      });

      if (!write) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Impossible d\'effectuer le transfert de propriété',
        });
        return;
      }

      try {
        await write();
      } catch (error) {
        console.error('Erreur lors du transfert de propriété:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Erreur lors du transfert de propriété',
        });
      }
    },
    [TOKEN_FORGE_ADDRESS]
  );

  return {
    error: state.error,
    success: state.successMessage,
    isAdmin: isAdmin,
    contractAddress: TOKEN_FORGE_ADDRESS,
    owner: ownerData as Address | undefined,
    isProcessing: false,
    networkCheck: state.networkCheck,
    contractCheck: state.contractCheck,
    walletCheck: state.walletCheck,
    handleTogglePause,
    transferOwnership,
    isPaused: isPaused,
    isPausing: false,
    isUnpausing: false,
    isTransferring: false,
    pauseAvailable,
  };
}
