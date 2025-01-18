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
  handleTransferOwnership: (newOwner: string) => Promise<void>;
  transferOwnership: (newOwner: string) => Promise<void>;
  error: string | null;
  successMessage: string | null;
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
  tokenCount: number;
  planStats: PlanStatsMap;
  handleUpdatePlanPrice: (planId: number, newPrice: bigint) => Promise<void>;
  handleTogglePause: () => Promise<void>;
  contractAddress: Address | null;
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

interface PlanStatsMap {
  [key: number]: {
    id: number;
    name: string;
    price: bigint;
    // Autres propriétés...
  };
}

const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  // États
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTx, setPendingTx] = useState<Record<string, any>>({});
  const [adminRights, setAdminRights] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [transferToAddress, setTransferToAddress] = useState<string | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
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

  // Lecture de l'état de pause avec gestion d'erreur
  const { data: pausedState, error: pausedError, isError: isPausedError, isLoading: isPausedLoading } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    watch: true,
    enabled: !!contractAddress && contractCheck.isValid && networkCheck.isCorrectNetwork,
    onError: (error) => {
      console.warn('Erreur lors de la lecture de l\'état de pause:', error);
      if (error instanceof Error && error.message.includes("execution reverted")) {
        setError("Le contrat n'est pas correctement initialisé. Veuillez réessayer plus tard.");
      } else {
        setError(error instanceof Error ? error.message : 'Erreur lors de la lecture de l\'état de pause');
      }
    }
  });

  // Valeurs dérivées de base
  const isValidContract = useMemo(() => contractCheck.isValid, [contractCheck.isValid]);
  const isCorrectNetwork = useMemo(() => networkCheck.isCorrectNetwork, [networkCheck.isCorrectNetwork]);
  const isOwner = useMemo(() => walletCheck.isContractOwner, [walletCheck.isContractOwner]);
  const isAdmin = useMemo(() => isOwner || adminRights.includes('admin'), [isOwner, adminRights]);

  // État de pause dérivé
  const isPaused = useMemo(() => {
    if (isPausedLoading) return false;
    if (isPausedError || !isValidContract || !isCorrectNetwork) return false;
    return !!pausedState;
  }, [pausedState, isPausedError, isValidContract, isCorrectNetwork, isPausedLoading]);

  // Configuration pour la mise à jour du prix
  const { config: updatePlanPriceConfig } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'updatePlanPrice',
    enabled: isAdmin && !!contractAddress && isValidContract && isCorrectNetwork,
  });

  const { write: writePlanPrice } = useContractWrite(updatePlanPriceConfig);

  // Configuration pour le transfert de propriété
  const { config: transferOwnershipConfig } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'transferOwnership',
    enabled: isOwner && !!contractAddress && isValidContract && isCorrectNetwork && !!transferToAddress,
    args: transferToAddress ? [transferToAddress as Address] : undefined,
  });

  const { write: writeTransferOwnership } = useContractWrite(transferOwnershipConfig);

  // Configuration pour la pause
  const { config: pauseConfig } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    enabled: isAdmin && !!contractAddress && isValidContract && isCorrectNetwork && !isPaused,
  });

  const { write: writePause } = useContractWrite(pauseConfig);

  // Configuration pour la reprise
  const { config: unpauseConfig } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    enabled: isAdmin && !!contractAddress && isValidContract && isCorrectNetwork && isPaused,
  });

  const { write: writeUnpause } = useContractWrite(unpauseConfig);

  // Fonctions utilitaires
  const handleError = useCallback((error: any, action: string) => {
    console.error(`Erreur lors de ${action}:`, error);
    if (error?.message?.includes('user rejected transaction')) {
      setError('Transaction rejetée par l\'utilisateur');
    } else if (error?.message?.includes('insufficient funds')) {
      setError('Fonds insuffisants pour effectuer la transaction');
    } else {
      setError(`Erreur lors de ${action}: ${error.message || 'Erreur inconnue'}`);
    }
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  }, []);

  // Fonction pour mettre à jour le prix avec gestion des erreurs
  const handleUpdatePlanPrice = useCallback(async (planId: number, newPrice: bigint) => {
    try {
      const config = usePrepareContractWrite({
        address: contractAddress as Address,
        abi: TokenForgeFactory.abi,
        functionName: 'updatePlanPrice',
        args: [BigInt(planId), newPrice],
      });
      await writePlanPrice?.();
      handleSuccess('Prix du plan mis à jour avec succès');
    } catch (error) {
      handleError(error, 'de la mise à jour du prix');
    }
  }, [writePlanPrice, handleSuccess, handleError, contractAddress]);

  // Fonction pour transférer la propriété
  const handleTransferOwnership = useCallback(async (newOwner: string) => {
    if (!isOwner || !contractAddress || !isValidContract || !isCorrectNetwork) {
      setError('Conditions non remplies pour le transfert de propriété');
      return;
    }
    try {
      setTransferToAddress(newOwner);
      await writeTransferOwnership?.();
      handleSuccess('Transfert de propriété initié avec succès');
    } catch (error) {
      handleError(error, 'du transfert de propriété');
    } finally {
      setTransferToAddress(null);
    }
  }, [isOwner, contractAddress, isValidContract, isCorrectNetwork, writeTransferOwnership, handleSuccess, handleError, setTransferToAddress]);

  // Fonction pour gérer la pause/reprise
  const handleTogglePause = useCallback(async () => {
    try {
      if (isPaused) {
        setIsUnpausing(true);
        await writeUnpause?.();
        handleSuccess('Contrat réactivé avec succès');
      } else {
        setIsPausing(true);
        await writePause?.();
        handleSuccess('Contrat mis en pause avec succès');
      }
    } catch (error) {
      handleError(error, isPaused ? 'de la réactivation' : 'de la mise en pause');
    } finally {
      setIsPausing(false);
      setIsUnpausing(false);
    }
  }, [isPaused, writePause, writeUnpause, handleSuccess, handleError]);

  // Lecture du propriétaire avec rafraîchissement automatique
  const { data: owner, refetch: refetchOwner } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'owner',
    watch: true,
    cacheTime: 0,
  });

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        await refetchOwner();
        const ownerAddress = owner as Address;
        if (ownerAddress && address && 
            ownerAddress.toLowerCase() === address.toLowerCase()) {
          setAdminRights(prev => [...prev, 'owner']);
          setWalletCheck(prev => ({ ...prev, isContractOwner: true }));
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
    };

    checkOwnership();
  }, [owner, address, refetchOwner]);

  // Lecture du nombre total de tokens
  const { data: tokenCount } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'allTokensLength',
    watch: true,
    enabled: !!contractAddress && isValidContract && isCorrectNetwork,
  });

  // Lecture des statistiques des plans
  const { data: planStatsData } = useContractRead({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'getPlanStats',
    watch: true,
    enabled: !!contractAddress && isValidContract && isCorrectNetwork,
  });

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
      setError(null);

      const { isConnected, isCorrectNetwork } = checkNetwork();
      if (!isConnected || !isCorrectNetwork) return;

      const walletStatus = checkWallet();
      if (!walletStatus.isConnected) return;

      const isContractValid = await checkContract();
      if (!isContractValid) return;

      // Vérification du propriétaire
      await refetchOwner();

      setLastActivity(new Date());

    } catch (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      handleError(error, 'checkAdminRights');
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddress, publicClient, chain, checkNetwork, checkWallet, handleError, checkContract, refetchOwner]);

  // Fonction pour réessayer les vérifications
  const handleRetryCheck = useCallback(async () => {
    setError(null);
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
      
      await writePause?.();
      setLastActivity(new Date());
      handleSuccess('Contrat mis en pause avec succès');
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
      
      await writeUnpause?.();
      setLastActivity(new Date());
      handleSuccess('Contrat réactivé avec succès');
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
    handleTransferOwnership,
    transferOwnership: handleTransferOwnership,
    error,
    successMessage,
    isCorrectNetwork,
    isWaitingForTx: isPausing || isUnpausing,
    isValidContract,
    pendingTx,
    isAdmin,
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
    handleRetryCheck,
    tokenCount: tokenCount as number,
    planStats: planStatsData as PlanStatsMap,
    handleUpdatePlanPrice,
    handleTogglePause,
    contractAddress,
  };
}
