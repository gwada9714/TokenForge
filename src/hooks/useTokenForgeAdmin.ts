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

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Erreur dans ${context}:`, error);
    
    let errorMessage = "Une erreur s'est produite. ";
    
    if (error instanceof Error) {
      // Erreurs spécifiques au réseau
      if (error.message.includes('network')) {
        errorMessage += "Problème de connexion au réseau Sepolia. Vérifiez votre connexion et réessayez.";
      }
      // Erreurs de contrat
      else if (error.message.includes('contract')) {
        errorMessage += "Problème avec le contrat. Vérifiez l'adresse et les permissions.";
      }
      // Erreurs de transaction
      else if (error.message.includes('transaction')) {
        errorMessage += "La transaction a échoué. Vérifiez votre solde et les frais de gas.";
      }
      // Autres erreurs
      else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += "Erreur inconnue. Veuillez réessayer.";
    }

    setErrorState(errorMessage);
    
    // Log pour debugging
    auditLogger.addLog({
      type: 'error',
      context,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      networkInfo: {
        chainId: chain?.id,
        networkName: chain?.name
      }
    });
  }, [chain]);

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

  const { data: isPaused } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    enabled: !!contractAddress
  });

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

  // Fonction pour mettre en pause le contrat
  const pause = useCallback(async (): Promise<void> => {
    if (!isOwner) {
      throw new Error('Vous devez être le propriétaire pour effectuer cette action');
    }

    if (!contractAddress) {
      throw new Error('Adresse du contrat non définie');
    }

    try {
      setIsLoading(true);
      const tx = await pauseContract();
      setTxHash(tx.hash);
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
    } catch (error: any) {
      handleError(error, 'pause');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, contractAddress, pauseContract, publicClient, handleError]);

  // Fonction pour désactiver la pause du contrat
  const unpause = useCallback(async (): Promise<void> => {
    if (!isOwner) {
      throw new Error('Vous devez être le propriétaire pour effectuer cette action');
    }

    if (!contractAddress) {
      throw new Error('Adresse du contrat non définie');
    }

    try {
      setIsLoading(true);
      const tx = await unpauseContract();
      setTxHash(tx.hash);
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
    } catch (error: any) {
      handleError(error, 'unpause');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOwner, contractAddress, unpauseContract, publicClient, handleError]);

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
      setErrorState(`Please connect to Sepolia network (current: ${chain?.name})`);
    } else if (!isValidContract) {
      setErrorState(`Invalid contract address: ${contractAddress}`);
    } else if (owner || transferPrepError) {
      const errorMessage = transferPrepError?.message || 'Error interacting with contract';
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
        paused: isPaused
      });
    }
  }, [errorState, contractAddress, chain, isOwner, isPaused]);

  return {
    isOwner: walletCheck.isContractOwner,
    isPaused: !!isPaused,
    pause,
    unpause,
    transferOwnership,
    error: errorState,
    isCorrectNetwork: networkCheck.isCorrectNetwork,
    isWaitingForTx: !!txHash,
    isValidContract: contractCheck.isValid,
    pendingTx,
    isAdmin: walletCheck.isContractOwner,
    owner: owner as Address | undefined,
    paused: !!isPaused,
    pauseAvailable: !isPaused,
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
