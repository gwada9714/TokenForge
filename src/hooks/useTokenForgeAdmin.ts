import { useAccount, useNetwork, usePublicClient, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactory from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../contexts/ContractContext';
import { useState, useCallback, useEffect, useMemo } from 'react';

// Types et interfaces
export interface TokenForgeAdminHookReturn {
  isOwner: boolean;
  isPaused: boolean;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  transferOwnership: (newOwner: string) => Promise<void>;
  error: string | undefined;
  isCorrectNetwork: boolean;
  isWaitingForTx: boolean;
  isValidContract: boolean;
  pendingTx: Record<string, boolean | string>;
  isAdmin: boolean;
  owner: Address | undefined;
  paused: boolean;
  pauseAvailable: boolean;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  setNewOwnerAddress: (address: string) => void;
  isLoading: boolean;
  adminRights: string[];
  lastActivity: Date | null;
  networkCheck: NetworkCheckResult;
  walletCheck: WalletCheckResult;
  contractCheck: ContractCheckResult;
  checkAdminRights: () => Promise<void>;
  handleRetryCheck: () => Promise<void>;
}

interface NetworkCheckResult {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkName: string | undefined;
  requiredNetwork: string;
}

interface WalletCheckResult {
  isConnected: boolean;
  hasCorrectAddress: boolean;
  currentAddress: string | undefined;
  isContractOwner: boolean;
}

interface ContractCheckResult {
  isValid: boolean;
  address: string | undefined;
  isDeployed: boolean;
  version: string | undefined;
  error?: string;
}

const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  // États
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTx, setPendingTx] = useState<Record<string, any>>({});
  const [adminRights, setAdminRights] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [networkCheck, setNetworkCheck] = useState<NetworkCheckResult>({
    isConnected: false,
    isCorrectNetwork: false,
    networkName: undefined,
    requiredNetwork: 'Sepolia'
  });
  const [walletCheck, setWalletCheck] = useState<WalletCheckResult>({
    isConnected: false,
    hasCorrectAddress: false,
    currentAddress: undefined,
    isContractOwner: false
  });
  const [contractCheck, setContractCheck] = useState<ContractCheckResult>({
    isValid: false,
    address: undefined,
    isDeployed: false,
    version: undefined
  });

  // Hooks Wagmi
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { contractAddress, error: contractContextError } = useContract();

  // Valeurs dérivées de base
  const isOwner = useMemo(() => walletCheck.isContractOwner, [walletCheck.isContractOwner]);
  const isValidContract = useMemo(() => contractCheck.isValid, [contractCheck.isValid]);
  const isCorrectNetwork = useMemo(() => networkCheck.isCorrectNetwork, [networkCheck.isCorrectNetwork]);

  // Lecture de l'état de pause avec gestion d'erreur
  const { data: pausedState, error: pausedError, isError: isPausedError, isLoading: isPausedLoading } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    watch: true,
    enabled: !!contractAddress && isValidContract && isCorrectNetwork,
    onError: (error) => {
      console.warn('Erreur lors de la lecture de l\'état de pause:', error);
      if (error instanceof Error && error.message.includes("execution reverted")) {
        setError("Le contrat n'est pas correctement initialisé. Veuillez réessayer plus tard.");
      } else {
        setError(error instanceof Error ? error.message : 'Erreur lors de la lecture de l\'état de pause');
      }
    }
  });

  // État de pause dérivé
  const isPaused = useMemo(() => {
    if (isPausedLoading) return false;
    if (isPausedError || !isValidContract || !isCorrectNetwork) return false;
    return !!pausedState;
  }, [pausedState, isPausedError, isValidContract, isCorrectNetwork, isPausedLoading]);

  // Hooks pour les interactions avec le contrat
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    enabled: isOwner && contractAddress !== null && !isPaused && isValidContract && isCorrectNetwork,
  });

  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    enabled: isOwner && contractAddress !== null && isPaused && isValidContract && isCorrectNetwork,
  });

  const { write: writePause, isLoading: isPausing } = useContractWrite({
    ...pauseConfig,
    onError: (error) => {
      handleError(error, 'pause');
    },
  });

  const { write: writeUnpause, isLoading: isUnpausing } = useContractWrite({
    ...unpauseConfig,
    onError: (error) => {
      handleError(error, 'unpause');
    },
  });

  // Fonctions utilitaires
  const handleError = useCallback((error: unknown, source: string) => {
    console.error(`Erreur dans ${source}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    
    if (errorMessage.includes('execution reverted')) {
      setError("L'opération a échoué. Vérifiez que le contrat est correctement initialisé et que vous avez les droits nécessaires.");
    } else if (errorMessage.includes('network')) {
      setError("Erreur réseau. Vérifiez votre connexion et que vous êtes sur le bon réseau (Sepolia).");
    } else if (errorMessage.includes('user rejected')) {
      setError("L'opération a été annulée par l'utilisateur.");
    } else {
      setError(errorMessage);
    }
  }, [setError]);

  // Vérification du réseau
  const checkNetwork = useCallback(() => {
    const isConnected = !!chain;
    const isCorrectNetwork = chain?.id === 11155111;
    
    setNetworkCheck({
      isConnected,
      isCorrectNetwork,
      networkName: chain?.name,
      requiredNetwork: 'Sepolia'
    });

    return { isConnected, isCorrectNetwork };
  }, [chain]);

  // Vérification du wallet
  const checkWallet = useCallback(() => {
    const isConnected = !!address;
    
    setWalletCheck({
      isConnected,
      hasCorrectAddress: !!address,
      currentAddress: address,
      isContractOwner: false
    });

    return { isConnected };
  }, [address]);

  // Vérification du contrat
  const checkContract = useCallback(async () => {
    if (!contractAddress) {
      setContractCheck({
        isValid: false,
        address: undefined,
        isDeployed: false,
        version: undefined,
        error: "Adresse du contrat non disponible"
      });
      return false;
    }

    try {
      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`
      });

      if (!code) {
        setContractCheck({
          isValid: false,
          address: contractAddress,
          isDeployed: false,
          version: undefined,
          error: "Le contrat n'est pas déployé sur ce réseau"
        });
        return false;
      }

      setContractCheck({
        isValid: true,
        address: contractAddress,
        isDeployed: true,
        version: '1.0'
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du contrat:', error);
      setContractCheck({
        isValid: false,
        address: contractAddress,
        isDeployed: false,
        version: undefined,
        error: error instanceof Error ? error.message : "Erreur lors de la vérification du contrat"
      });
      return false;
    }
  }, [contractAddress, publicClient]);

  // Vérification des droits d'administration
  const checkAdminRights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const { isConnected, isCorrectNetwork } = checkNetwork();
      if (!isConnected || !isCorrectNetwork) return;

      const walletStatus = checkWallet();
      if (!walletStatus.isConnected) return;

      const isContractValid = await checkContract();
      if (!isContractValid) return;

      // Vérification du propriétaire
      const ownerAddress = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: TokenForgeFactory.abi,
        functionName: 'owner'
      });

      console.log('Vérification des droits:', {
        ownerAddress,
        currentAddress: address,
        isOwner: ownerAddress === address
      });

      setWalletCheck(prev => ({
        ...prev,
        isContractOwner: ownerAddress === address
      }));

      if (ownerAddress === address) {
        setAdminRights(['OWNER']);
        setError(undefined);
      } else {
        setAdminRights([]);
        setError("Vous n'êtes pas le propriétaire de ce contrat");
      }

      setLastActivity(new Date());

    } catch (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      handleError(error, 'checkAdminRights');
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddress, publicClient, chain, checkNetwork, checkWallet, handleError, checkContract]);

  // Fonction pour réessayer les vérifications
  const handleRetryCheck = useCallback(async () => {
    setError(undefined);
    await checkAdminRights();
  }, [checkAdminRights]);

  // Fonction pour mettre en pause avec vérifications
  const pause = async () => {
    try {
      if (!isCorrectNetwork) throw new Error("Veuillez vous connecter au bon réseau");
      if (!isValidContract) throw new Error("Le contrat n'est pas valide");
      if (!isOwner) throw new Error("Vous n'avez pas les droits pour mettre en pause le contrat");
      if (!writePause) throw new Error("La fonction de pause n'est pas disponible");
      if (isPausedError) throw new Error("Impossible de vérifier l'état de pause du contrat");
      if (isPaused) throw new Error("Le contrat est déjà en pause");
      
      await writePause();
      setLastActivity(new Date());
    } catch (error) {
      handleError(error, 'pause');
      throw error;
    }
  };

  // Fonction pour désactiver la pause avec vérifications
  const unpause = async () => {
    try {
      if (!isCorrectNetwork) throw new Error("Veuillez vous connecter au bon réseau");
      if (!isValidContract) throw new Error("Le contrat n'est pas valide");
      if (!isOwner) throw new Error("Vous n'avez pas les droits pour désactiver la pause");
      if (!writeUnpause) throw new Error("La fonction de désactivation de pause n'est pas disponible");
      if (isPausedError) throw new Error("Impossible de vérifier l'état de pause du contrat");
      if (!isPaused) throw new Error("Le contrat n'est pas en pause");
      
      await writeUnpause();
      setLastActivity(new Date());
    } catch (error) {
      handleError(error, 'unpause');
      throw error;
    }
  };

  // Effet pour la vérification initiale
  useEffect(() => {
    checkAdminRights();
  }, [checkAdminRights]);

  return {
    isOwner,
    isPaused,
    pause,
    unpause,
    transferOwnership: async () => {},
    error: error || pausedError?.message,
    isCorrectNetwork,
    isWaitingForTx: isPausing || isUnpausing,
    isValidContract,
    pendingTx,
    isAdmin: isOwner,
    owner: undefined,
    paused: isPaused,
    pauseAvailable: isOwner && !isPaused,
    isPausing,
    isUnpausing,
    isTransferring: false,
    setNewOwnerAddress: () => {},
    isLoading,
    adminRights,
    lastActivity,
    networkCheck,
    walletCheck,
    contractCheck,
    checkAdminRights,
    handleRetryCheck
  };
}
