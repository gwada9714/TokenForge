import { useAccount, useNetwork, usePublicClient, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactory from '../contracts/abi/TokenForgeFactory.json';
import { useContract } from '../providers/ContractProvider';
import { useContractCache, CacheConfig } from './useContractCache';
import { auditLogger, AuditActionType, LogDetails } from '../services/auditLogger';
import { alertService } from '../services/alertService';
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
}

function useNullableContractCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: CacheConfig
): { data: T | undefined; isLoading: boolean; error: Error | null } {
  const result = useContractCache(key, fetcher, config);
  return {
    data: result.data ?? undefined,
    isLoading: result.isLoading,
    error: result.error
  };
}

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [errorState, setErrorState] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [pendingTx, setPendingTx] = useState<Record<string, string | boolean>>({});

  const handleNotification = useCallback((message: string, type: 'success' | 'error') => {
    // TODO: implémenter la fonction de notification
  }, []);

  const logAction = useCallback((
    action: AuditActionType,
    status: 'SUCCESS' | 'FAILED',
    details: Omit<LogDetails, 'status'>
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

  const handleTransactionSuccess = useCallback(async (tx: { hash: `0x${string}` }, action: AuditActionType) => {
    setTxHash(tx.hash);
    
    // Attendre la transaction pour obtenir le gasUsed
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx.hash });
    
    // Log avec gasUsed
    logAction(action, 'SUCCESS', {
      transactionHash: tx.hash,
      gasUsed: Number(receipt.gasUsed),
      networkInfo: {
        chainId: chain?.id || 0,
        networkName: chain?.name || 'unknown'
      }
    });

    // Vérifier les alertes
    const matchingRules = alertService.checkAlert(action, 'SUCCESS');
    matchingRules.forEach(rule => {
      handleNotification(rule.notificationMessage, 'success');
    });

    // Reset après 5 secondes
    setTimeout(() => setTxHash(undefined), 5000);
  }, [chain, publicClient, logAction, handleNotification]);

  const handleTransactionError = useCallback((error: unknown, action: AuditActionType) => {
    const message = error instanceof Error ? error.message : 'Une erreur est survenue';
    setErrorState(message);
    
    logAction(action, 'FAILED', {
      error: message,
      networkInfo: {
        chainId: chain?.id || 0,
        networkName: chain?.name || 'unknown'
      }
    });

    // Vérifier les alertes
    const matchingRules = alertService.checkAlert(action, 'FAILED');
    matchingRules.forEach(rule => {
      handleNotification(rule.notificationMessage, 'error');
    });
  }, [chain, logAction, handleNotification]);

  const { contractAddress } = useContract();
  const { data: ownerData, isLoading: ownerLoading } = useNullableContractCache<Address>(
    `owner-${contractAddress}`,
    async () => {
      if (!contractAddress) {
        throw new Error('No contract address');
      }
      const data = await publicClient.readContract({
        address: contractAddress as Address,
        abi: TokenForgeFactory.abi,
        functionName: 'owner'
      });
      return data as Address;
    },
    { ttl: 60000 } // Cache pendant 1 minute
  );

  const { data: pausedData, isLoading: pausedLoading } = useNullableContractCache<boolean>(
    `paused-${contractAddress}`,
    async () => {
      if (!contractAddress) {
        throw new Error('No contract address');
      }
      const data = await publicClient.readContract({
        address: contractAddress as Address,
        abi: TokenForgeFactory.abi,
        functionName: 'paused'
      });
      return data as boolean;
    },
    { ttl: 30000 } // Cache pendant 30 secondes
  );

  const { config: pauseConfig, error: pausePrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    enabled: !!contractAddress && !pausedData,
  });

  const { config: unpauseConfig, error: unpausePrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    enabled: !!contractAddress && pausedData,
  });

  const { config: transferConfig, error: transferPrepError } = usePrepareContractWrite({
    address: contractAddress as Address,
    abi: TokenForgeFactory.abi,
    functionName: 'transferOwnership',
    args: [pendingTx.transfer],
    enabled: !!contractAddress && !!pendingTx.transfer,
  });

  const { writeAsync: pauseContract } = useContractWrite(pauseConfig);
  const { writeAsync: unpauseContract } = useContractWrite(unpauseConfig);
  const { writeAsync: transferContract } = useContractWrite(transferConfig);

  const isOwner = useMemo(() => {
    if (!address || !ownerData) {
      return false;
    }
    return address.toLowerCase() === ownerData.toLowerCase();
  }, [address, ownerData]);

  const isCorrectNetwork = useMemo(() => {
    return chain?.id === 11155111;
  }, [chain]);

  const isValidContract = useMemo(() => {
    if (!contractAddress) {
      return false;
    }
    try {
      return true;
    } catch (err) {
      console.error('Invalid contract address:', err);
      return false;
    }
  }, [contractAddress]);

  const pause = useCallback(async () => {
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

      if (pendingTx.pause) {
        throw new TokenForgeError(
          "Une transaction pause est déjà en cours",
          TokenForgeErrorCode.TX_IN_PROGRESS
        );
      }

      setPendingTx(prev => ({ ...prev, pause: true }));

      const tx = await pauseContract?.();
      if (!tx?.hash) {
        throw new TokenForgeError(
          "La transaction a échoué",
          TokenForgeErrorCode.TX_FAILED
        );
      }

      handleTransactionSuccess(tx, 'pause' as AuditActionType);
      
    } catch (err) {
      logAction('pause' as AuditActionType, 'FAILED', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        networkInfo: {
          chainId: chain?.id || 0,
          networkName: chain?.name || 'unknown'
        }
      });
      handleTransactionError(err, 'pause' as AuditActionType);
    } finally {
      setPendingTx(prev => ({ ...prev, pause: false }));
    }
  }, [pauseContract, address, isCorrectNetwork, isValidContract, isOwner, pendingTx, handleTransactionSuccess, handleTransactionError, logAction]);

  const unpause = useCallback(async () => {
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

      if (pendingTx.unpause) {
        throw new TokenForgeError(
          "Une transaction unpause est déjà en cours",
          TokenForgeErrorCode.TX_IN_PROGRESS
        );
      }

      setPendingTx(prev => ({ ...prev, unpause: true }));

      const tx = await unpauseContract?.();
      if (!tx?.hash) {
        throw new TokenForgeError(
          "La transaction a échoué",
          TokenForgeErrorCode.TX_FAILED
        );
      }

      handleTransactionSuccess(tx, 'unpause' as AuditActionType);
      
    } catch (err) {
      logAction('unpause' as AuditActionType, 'FAILED', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        networkInfo: {
          chainId: chain?.id || 0,
          networkName: chain?.name || 'unknown'
        }
      });
      handleTransactionError(err, 'unpause' as AuditActionType);
    } finally {
      setPendingTx(prev => ({ ...prev, unpause: false }));
    }
  }, [unpauseContract, address, isCorrectNetwork, isValidContract, isOwner, pendingTx, handleTransactionSuccess, handleTransactionError, logAction]);

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

      setPendingTx(prev => ({ ...prev, transfer: newOwner }));

      const tx = await transferContract?.();
      if (!tx?.hash) {
        throw new TokenForgeError(
          "La transaction a échoué",
          TokenForgeErrorCode.TX_FAILED
        );
      }

      handleTransactionSuccess(tx, 'transfer' as AuditActionType);
      
    } catch (err) {
      logAction('transfer' as AuditActionType, 'FAILED', { 
        error: err instanceof Error ? err.message : 'Unknown error',
        targetAddress: newOwner as Address,
        networkInfo: {
          chainId: chain?.id || 0,
          networkName: chain?.name || 'unknown'
        }
      });
      handleTransactionError(err, 'transfer' as AuditActionType);
    } finally {
      setPendingTx(prev => {
        const newState = { ...prev };
        delete newState.transfer;
        return newState;
      });
    }
  }, [transferContract, address, isCorrectNetwork, isValidContract, isOwner, pendingTx, handleTransactionSuccess, handleTransactionError, logAction]);

  // Gestion des erreurs
  useEffect(() => {
    if (!isCorrectNetwork) {
      setErrorState(`Please connect to Sepolia network (current: ${chain?.name})`);
    } else if (!isValidContract) {
      setErrorState(`Invalid contract address: ${contractAddress}`);
    } else if (ownerLoading || pausedLoading || pausePrepError || unpausePrepError || transferPrepError) {
      const errorMessage = pausePrepError?.message || unpausePrepError?.message || transferPrepError?.message || 'Error interacting with contract';
      setErrorState(errorMessage);
    } else {
      setErrorState(undefined);
    }
  }, [isCorrectNetwork, isValidContract, ownerLoading, pausedLoading, pausePrepError, unpausePrepError, transferPrepError, chain?.name, contractAddress]);

  useEffect(() => {
    if (errorState) {
      console.error('Erreur TokenForge:', {
        message: errorState,
        contract: contractAddress,
        network: chain?.name,
        isAdmin: isOwner,
        paused: pausedData
      });
    }
  }, [errorState, contractAddress, chain, isOwner, pausedData]);

  const hookReturn: TokenForgeAdminHookReturn = {
    isOwner,
    isPaused: pausedData ?? false,
    pause,
    unpause,
    transferOwnership,
    error: errorState,
    isCorrectNetwork,
    isWaitingForTx: Boolean(txHash),
    isValidContract,
    pendingTx,
    isAdmin: isOwner,
    owner: ownerData || undefined,
    paused: pausedData ?? false,
    pauseAvailable: !(pausedData ?? false),
    isPausing: Boolean(pendingTx.pause),
    isUnpausing: Boolean(pendingTx.unpause),
    isTransferring: typeof pendingTx.transfer === 'string',
    setNewOwnerAddress: (address: string) => setPendingTx(prev => ({ ...prev, transfer: address })),
    isLoading: ownerLoading || pausedLoading
  };

  return hookReturn;
}
