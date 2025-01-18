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

  // Fonctions utilitaires
  const handleError = useCallback((error: unknown, source: string) => {
    console.error(`Erreur dans ${source}:`, error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    setError(message);
  }, []);

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
    try {
      if (!contractAddress) {
        setContractCheck(prev => ({
          ...prev,
          isValid: false,
          error: 'Adresse du contrat non disponible'
        }));
        return false;
      }

      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`
      });

      const isDeployed = !!code;
      
      setContractCheck({
        isValid: isDeployed,
        address: contractAddress,
        isDeployed,
        version: '1.0',
        error: isDeployed ? undefined : 'Contrat non déployé'
      });

      return isDeployed;
    } catch (error) {
      console.error('Erreur lors de la vérification du contrat:', error);
      setContractCheck(prev => ({
        ...prev,
        isValid: false,
        error: 'Erreur lors de la vérification du contrat'
      }));
      return false;
    }
  }, [contractAddress, publicClient]);

  // Vérification des droits d'administration
  const checkAdminRights = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Vérification du réseau
      const { isConnected, isCorrectNetwork } = checkNetwork();
      if (!isConnected) {
        setError("Veuillez connecter votre wallet");
        return;
      }
      if (!isCorrectNetwork) {
        setError(`Veuillez vous connecter au réseau Sepolia (réseau actuel : ${chain?.name})`);
        return;
      }

      // Vérification du wallet
      const { isConnected: isWalletConnected } = checkWallet();
      if (!isWalletConnected) {
        setError("Wallet non connecté");
        return;
      }

      // Vérification du contrat
      if (!contractAddress) {
        setError("Adresse du contrat non disponible");
        return;
      }

      // Vérification du code du contrat
      const code = await publicClient.getBytecode({
        address: contractAddress as `0x${string}`
      });

      if (!code) {
        setError("Le contrat n'est pas déployé sur ce réseau");
        return;
      }

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
      setContractCheck({
        isValid: true,
        address: contractAddress,
        isDeployed: true,
        version: '1.0'
      });

    } catch (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      handleError(error, 'checkAdminRights');
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddress, publicClient, chain, checkNetwork, checkWallet, handleError]);

  // Fonction pour réessayer les vérifications
  const handleRetryCheck = useCallback(async () => {
    setError(undefined);
    await checkAdminRights();
  }, [checkAdminRights]);

  // Effet pour la vérification initiale
  useEffect(() => {
    checkAdminRights();
  }, [checkAdminRights]);

  // Valeurs dérivées
  const isOwner = useMemo(() => walletCheck.isContractOwner, [walletCheck.isContractOwner]);
  const isValidContract = useMemo(() => contractCheck.isValid, [contractCheck.isValid]);
  const isCorrectNetwork = useMemo(() => networkCheck.isCorrectNetwork, [networkCheck.isCorrectNetwork]);

  return {
    isOwner,
    isPaused: false,
    pause: async () => {},
    unpause: async () => {},
    transferOwnership: async () => {},
    error,
    isCorrectNetwork,
    isWaitingForTx: false,
    isValidContract,
    pendingTx,
    isAdmin: isOwner,
    owner: undefined,
    paused: false,
    pauseAvailable: false,
    isPausing: false,
    isUnpausing: false,
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
