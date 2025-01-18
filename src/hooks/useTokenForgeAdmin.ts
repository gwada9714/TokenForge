import { useAccount, useNetwork, usePublicClient, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactory from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';
import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Interface pour les retours du hook useTokenForgeAdmin
 */
export interface TokenForgeAdminHookReturn {
  /** Si l'utilisateur est le propriétaire du contrat */
  isOwner: boolean;
  /** État de pause du contrat */
  isPaused: boolean;
  /** Fonction pour mettre en pause le contrat */
  pause: () => Promise<void>;
  /** Fonction pour réactiver le contrat */
  unpause: () => Promise<void>;
  /** Fonction pour transférer la propriété du contrat */
  transferOwnership: (newOwner: string) => Promise<void>;
  /** Message d'erreur */
  error: string | undefined;
  /** Si le réseau est correct */
  isCorrectNetwork: boolean;
  /** Si une transaction est en attente */
  isWaitingForTx: boolean;
  /** Si le contrat est valide */
  isValidContract: boolean;
  /** Si une transaction est en cours */
  pendingTx: Record<string, boolean | string>;
  /** Si l'utilisateur est admin */
  isAdmin: boolean;
  /** Adresse du propriétaire */
  owner: Address | undefined;
  /** Si le contrat est en pause */
  paused: boolean;
  /** Si une pause est disponible */
  pauseAvailable: boolean;
  /** Si une pause est en cours */
  isPausing: boolean;
  /** Si une dépause est en cours */
  isUnpausing: boolean;
  /** Si un transfert est en cours */
  isTransferring: boolean;
  /** Fonction pour définir la nouvelle adresse du propriétaire */
  setNewOwnerAddress: (address: string) => void;
  /** Si le chargement est en cours */
  isLoading: boolean;
  /** Droits d'administration */
  adminRights: AdminRight[];
  /** Dernière activité */
  lastActivity: Date | null;
  /** Fonction pour vérifier les droits d'administration */
  checkAdminRights: () => Promise<void>;
  /** Résultats des vérifications réseau */
  networkCheck: NetworkCheckResult;
  /** Résultats des vérifications wallet */
  walletCheck: WalletCheckResult;
  /** Fonction pour vérifier la configuration */
  checkConfiguration: () => Promise<boolean>;
  /** Résultats des vérifications du contrat */
  contractCheck: ContractCheckResult;
  /** Fonction pour vérifier le contrat */
  verifyContract: () => Promise<boolean>;
}

type AdminRight = 'OWNER' | 'ADMIN' | 'MODERATOR';

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

// Types pour les alertes et les logs
interface AlertRule {
  notificationMessage: string;
  // autres propriétés...
}

interface LogDetails {
  transactionHash?: `0x${string}`;
  gasUsed?: number;
  error?: string;
  targetAddress?: string;
  networkInfo: {
    chainId: number;
    networkName: string;
  };
}

// Service d'alerte simulé
const alertService = {
  checkAlert: (action: string, status: string): AlertRule[] => {
    // Simulation de règles d'alerte
    return [{
      notificationMessage: `${action} ${status.toLowerCase()}`
    }];
  }
};

// Service de log simulé
const auditLogger = {
  addLog: (log: any) => {
    console.log('Audit log:', log);
  }
};

import { getAddress, isAddress } from 'viem';

// Utilitaires de validation et de réseau
const SEPOLIA_CHAIN_ID = 11155111;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const normalizeAddress = (address: string): string | null => {
  try {
    if (!isAddress(address)) return null;
    return getAddress(address); // Convertit en format checksum
  } catch {
    return null;
  }
};

const retry = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay);
  }
};

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { contractAddress } = useContract();

  // États locaux
  const [errorState, setErrorState] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [pendingTx, setPendingTx] = useState<Record<string, string | boolean>>({});
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [adminRights, setAdminRights] = useState<AdminRight[]>([]);
  const [lastVerificationTime, setLastVerificationTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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
    version: undefined,
    error: undefined
  });

  // Fonction de log améliorée
  const logDebug = useCallback((action: string, data: any) => {
    console.group(`TokenForgeAdmin - ${action}`);
    console.log('Data:', data);
    console.log('Network:', chain?.name);
    console.log('Account:', address);
    console.log('Contract:', contractAddress);
    console.groupEnd();
  }, [chain?.name, address, contractAddress]);

  const handleError = useCallback((error: any, action: string) => {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.message?.includes('user rejected')) {
      errorMessage = 'La transaction a été rejetée par l\'utilisateur';
    } else if (error.message?.includes('insufficient permissions')) {
      errorMessage = 'Vous n\'avez pas les permissions nécessaires pour cette action';
    } else if (error.message?.includes('execution reverted')) {
      errorMessage = 'La transaction a échoué - vérifiez vos permissions';
    }

    logDebug('Error', {
      action,
      error: error.message,
      errorCode: error.code,
      errorName: error.name
    });

    setErrorState(errorMessage);
  }, [logDebug]);

  const checkNetworkAndContract = useCallback(async () => {
    try {
      // Vérification du réseau
      if (!chain) {
        throw new Error("Aucun réseau détecté. Veuillez connecter votre wallet.");
      }
      
      if (chain.id !== SEPOLIA_CHAIN_ID) {
        throw new Error(`Veuillez vous connecter au réseau Sepolia (ID: ${SEPOLIA_CHAIN_ID}). Réseau actuel: ${chain.name}`);
      }

      // Vérification du contrat
      if (!contractAddress) {
        throw new Error("Aucune adresse de contrat fournie.");
      }

      const normalizedAddress = normalizeAddress(contractAddress);
      if (!normalizedAddress) {
        throw new Error(`Adresse de contrat invalide: ${contractAddress}`);
      }

      return { normalizedAddress, chain };
    } catch (error) {
      handleError(error, 'checkNetworkAndContract');
      throw error;
    }
  }, [chain, contractAddress, handleError]);

  // Lecture du contrat avec retry
  const { data: owner } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'owner',
    enabled: !!contractAddress
  });

  const { data: isPaused, error: pausedError } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    enabled: !!contractAddress,
    onError: (error) => {
      console.error('Erreur lors de la lecture de paused():', error);
    }
  });

  // Utiliser une valeur par défaut si la lecture échoue
  const effectivePaused: boolean = isPaused === undefined ? false : Boolean(isPaused);

  const { writeAsync: pauseContract } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'pause'
  });

  const { writeAsync: unpauseContract } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause'
  });

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = useMemo(() => {
    return address && owner && typeof address === 'string' && typeof owner === 'string' && 
      address.toLowerCase() === owner.toLowerCase();
  }, [address, owner]);

  // Vérification des permissions améliorée
  const checkPermissions = useCallback(async () => {
    if (!address || !contractAddress) {
      throw new Error('Adresse du wallet ou du contrat non définie');
    }

    try {
      const ownerAddress = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: TokenForgeFactory.abi,
        functionName: 'owner'
      });

      logDebug('Permissions Check', {
        owner: ownerAddress,
        caller: address,
        isOwner: ownerAddress === address
      });

      return ownerAddress === address;
    } catch (error) {
      handleError(error, 'checkPermissions');
      return false;
    }
  }, [address, contractAddress, publicClient, logDebug, handleError]);

  // Fonction pause améliorée
  const pause = useCallback(async (): Promise<void> => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour cette action');
      }

      logDebug('Pause - Start', { isOwner });

      setIsLoading(true);
      const tx = await pauseContract();
      setTxHash(tx.hash);

      logDebug('Pause - Transaction', { hash: tx.hash });

      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      logDebug('Pause - Success', { hash: tx.hash });
    } catch (error: any) {
      handleError(error, 'pause');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, pauseContract, publicClient, checkPermissions, logDebug, handleError]);

  // Fonction unpause améliorée
  const unpause = useCallback(async (): Promise<void> => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour cette action');
      }

      logDebug('Unpause - Start', { isOwner });

      setIsLoading(true);
      const tx = await unpauseContract();
      setTxHash(tx.hash);

      logDebug('Unpause - Transaction', { hash: tx.hash });

      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      logDebug('Unpause - Success', { hash: tx.hash });
    } catch (error: any) {
      handleError(error, 'unpause');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, unpauseContract, publicClient, checkPermissions, logDebug, handleError]);

  // Valeurs dérivées avec validation améliorée
  const isCorrectNetwork = useMemo(() => {
    if (!chain) return false;
    return chain.id === SEPOLIA_CHAIN_ID;
  }, [chain]);

  const isValidContract = useMemo(() => {
    if (!contractAddress) return false;
    try {
      const normalizedAddress = normalizeAddress(contractAddress);
      return normalizedAddress !== null;
    } catch {
      return false;
    }
  }, [contractAddress]);

  // Fonction de vérification améliorée
  const verifyContract = useCallback(async () => {
    setIsLoading(true);
    try {
      // Vérifier le réseau
      if (!chain || chain.id !== SEPOLIA_CHAIN_ID) {
        throw new Error('Veuillez vous connecter au réseau Sepolia');
      }

      // Vérifier l'adresse du contrat
      if (!contractAddress) {
        throw new Error("L'adresse du contrat n'est pas définie");
      }

      const normalizedAddress = normalizeAddress(contractAddress);
      if (!normalizedAddress) {
        throw new Error("Format d'adresse de contrat invalide");
      }

      // Vérifier le bytecode du contrat
      const code = await retry(async () => {
        const result = await publicClient.getBytecode({
          address: normalizedAddress as `0x${string}`
        });
        
        if (!result || result.length === 0) {
          throw new Error("Aucun code trouvé à cette adresse. Le contrat n'est pas déployé.");
        }
        return result;
      });

      // Vérifier si le contrat a les bonnes fonctions en vérifiant owner()
      const owner = await retry(async () => {
        try {
          return await publicClient.readContract({
            address: normalizedAddress as `0x${string}`,
            abi: TokenForgeFactory.abi,
            functionName: 'owner'
          });
        } catch (error) {
          console.error('Erreur lors de la lecture du propriétaire:', error);
          throw new Error("Le contrat ne semble pas être un TokenForgeFactory valide");
        }
      });

      setContractCheck({
        isValid: true,
        address: normalizedAddress || undefined, // Conversion de null en undefined
        isDeployed: true,
        version: 'v1', // Version fixe car pas de fonction version()
        error: undefined
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du contrat:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la vérification du contrat";
      setContractCheck({
        isValid: false,
        address: undefined, // On met undefined en cas d'erreur
        isDeployed: false,
        version: undefined,
        error: errorMessage
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [chain, contractAddress, publicClient]);

  const cachedVerifyContract = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    if (!force && now - lastVerificationTime < 30000 && contractCheck.isValid) {
      return true;
    }

    const result = await verifyContract();
    setLastVerificationTime(now);
    return result;
  }, [verifyContract, lastVerificationTime, contractCheck.isValid]);

  const checkConfiguration = useCallback(async () => {
    try {
      // Vérification du réseau
      setNetworkCheck({
        isConnected: !!chain,
        isCorrectNetwork: chain?.id === SEPOLIA_CHAIN_ID,
        networkName: chain?.name,
        requiredNetwork: 'Sepolia'
      });

      // Vérification du wallet
      setWalletCheck({
        isConnected: !!address,
        hasCorrectAddress: !!address,
        currentAddress: address,
        isContractOwner: address === owner
      });

      // Vérification du contrat
      const isContractValid = await verifyContract();

      return isContractValid && !!chain && chain.id === SEPOLIA_CHAIN_ID && !!address;
    } catch (error) {
      handleError(error, 'checkConfiguration');
      return false;
    }
  }, [chain, address, owner, verifyContract, handleError]);

  // Fonctions utilitaires
  const handleNotification = useCallback((message: string, type: 'success' | 'error') => {
    // TODO: implémenter la fonction de notification
  }, []);

  const logAction = useCallback((
    action: 'pause' | 'unpause' | 'transfer',
    status: 'SUCCESS' | 'FAILED',
    details: LogDetails
  ) => {
    if (!address || !chain) return;

    auditLogger.addLog({
      timestamp: new Date().toISOString(),
      action,
      performedBy: address,
      details: {
        status,
        ...details,
        networkInfo: {
          chainId: chain.id,
          networkName: chain.name
        }
      }
    });
  }, [address, chain]);

  const handleTransactionError = useCallback((error: unknown, action: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setErrorState(errorMessage);
    
    const alerts = alertService.checkAlert(action, 'FAILED');
    alerts.forEach(alert => {
      handleNotification(alert.notificationMessage, 'error');
    });
  }, [handleNotification]);

  const handleTransactionSuccess = useCallback(async (tx: { hash: `0x${string}` }, action: 'pause' | 'unpause' | 'transfer') => {
    setTxHash(tx.hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx.hash });
    
    logAction(action, 'SUCCESS', {
      transactionHash: tx.hash,
      gasUsed: Number(receipt.gasUsed),
      networkInfo: {
        chainId: chain?.id || 0,
        networkName: chain?.name || 'unknown'
      }
    });

    const alerts = alertService.checkAlert(action, 'SUCCESS');
    alerts.forEach(alert => {
      handleNotification(alert.notificationMessage, 'success');
    });
  }, [chain, publicClient, logAction, handleNotification]);

  // Préparation des transactions
  const { config: transferConfig, error: transferPrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'transferOwnership',
    args: [pendingTx.transfer],
    enabled: !!contractAddress && !!pendingTx.transfer,
  });

  const { writeAsync: transferContract, error: transferError } = useContractWrite({
    ...transferConfig,
    onError: (error) => {
      console.error('Erreur lors du transfert:', error);
      handleTransactionError(error, 'transfer');
    }
  });

  const transferOwnership = useCallback(async (newOwner: string) => {
    try {
      if (!address) {
        throw new TokenForgeError(
          "Veuillez connecter votre portefeuille",
          TokenForgeErrorCode.UNAUTHORIZED
        );
      }

      if (!isCorrectNetwork) {
        throw new TokenForgeError(
          `Veuillez vous connecter au réseau Sepolia`,
          TokenForgeErrorCode.WRONG_NETWORK
        );
      }

      if (!isValidContract) {
        throw new TokenForgeError(
          "Configuration invalide du contrat",
          TokenForgeErrorCode.CONTRACT_ERROR
        );
      }

      if (!isOwner) {
        throw new TokenForgeError(
          "Seul le propriétaire peut effectuer cette action",
          TokenForgeErrorCode.UNAUTHORIZED
        );
      }

      if (pendingTx.transfer) {
        throw new TokenForgeError(
          "Une transaction transfer est déjà en cours",
          TokenForgeErrorCode.TX_IN_PROGRESS
        );
      }

      if (!transferContract) {
        throw new TokenForgeError(
          "La fonction de transfert n'est pas disponible",
          TokenForgeErrorCode.CONTRACT_ERROR
        );
      }

      setPendingTx(prev => ({ ...prev, transfer: newOwner }));

      const tx = await transferContract();
      if (!tx?.hash) {
        throw new TokenForgeError(
          "La transaction a échoué",
          TokenForgeErrorCode.TX_FAILED
        );
      }

      await handleTransactionSuccess(tx, 'transfer');
      
    } catch (err) {
      console.error('Erreur lors du transfert:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorState(errorMessage);
      
      logAction('transfer', 'FAILED', { 
        error: errorMessage,
        targetAddress: newOwner as Address,
        networkInfo: {
          chainId: chain?.id || 0,
          networkName: chain?.name || 'unknown'
        }
      });
      
      if (err instanceof TokenForgeError) {
        handleTransactionError(err, 'transfer');
      }
    } finally {
      setPendingTx(prev => {
        const newState = { ...prev };
        delete newState.transfer;
        return newState;
      });
    }
  }, [
    transferContract,
    address,
    isCorrectNetwork,
    isValidContract,
    isOwner,
    pendingTx,
    handleTransactionSuccess,
    handleTransactionError,
    logAction,
    chain,
    setErrorState
  ]);

  const checkAdminRights = useCallback(async () => {
    const isConfigValid = await checkConfiguration();
    if (!isConfigValid) {
      return;
    }

    try {
      const rights: AdminRight[] = [];
      if (walletCheck.isContractOwner) {
        rights.push('OWNER');
        rights.push('ADMIN');
        rights.push('MODERATOR');
      }

      setAdminRights(rights);
      setLastActivity(new Date());
    } catch (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      setErrorState("Erreur lors de la vérification des droits d'administration");
    }
  }, [checkConfiguration, walletCheck.isContractOwner]);

  useEffect(() => {
    checkConfiguration();
  }, [address, chain, checkConfiguration]);

  useEffect(() => {
    if (contractAddress && !owner) {
      checkConfiguration();
    }
  }, [contractAddress, owner, checkConfiguration]);

  useEffect(() => {
    if (!isCorrectNetwork) {
      setErrorState(`Veuillez vous connecter au réseau Sepolia (actuel: ${chain?.name})`);
    } else if (!isValidContract) {
      setErrorState(`Adresse de contrat invalide: ${contractAddress}`);
    } else if (owner || transferPrepError) {
      const errorMessage = transferPrepError?.message || 'Erreur lors de l\'interaction avec le contrat';
      setErrorState(errorMessage);
    } else {
      setErrorState(undefined);
    }
  }, [isCorrectNetwork, isValidContract, owner, transferPrepError, chain?.name, contractAddress]);

  useEffect(() => {
    if (errorState) {
      console.error('Erreur TokenForge:', {
        message: errorState,
        contract: contractAddress,
        network: chain?.name,
        isAdmin: isOwner,
        paused: effectivePaused
      });
    }
  }, [errorState, contractAddress, chain, isOwner, effectivePaused]);

  return {
    isOwner: walletCheck.isContractOwner,
    isPaused: effectivePaused,
    pause,
    unpause,
    transferOwnership,
    error: errorState,
    isCorrectNetwork: networkCheck.isCorrectNetwork,
    isWaitingForTx: Boolean(txHash),
    isValidContract: contractCheck.isValid,
    pendingTx,
    isAdmin: walletCheck.isContractOwner,
    owner: owner as Address | undefined,
    paused: effectivePaused,
    pauseAvailable: !effectivePaused,
    isPausing: Boolean(pendingTx.pause),
    isUnpausing: Boolean(pendingTx.unpause),
    isTransferring: typeof pendingTx.transfer === 'string',
    setNewOwnerAddress: (address: string) => setPendingTx(prev => ({ ...prev, transfer: address })),
    isLoading: isLoading,
    adminRights,
    lastActivity,
    checkAdminRights,
    networkCheck,
    walletCheck,
    contractCheck,
    verifyContract,
    checkConfiguration
  };
}
