import { useAccount, useNetwork, usePublicClient, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactoryABI from '../contracts/abi/TokenFactoryABI.json';
import { useContract } from '../contexts/ContractContext';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { TOKEN_FORGE_ADDRESS } from '../constants/addresses';

// Types et interfaces
export interface TokenForgeAdminHookReturn {
  error: string | null;
  successMessage: string | null;
  isLoading: boolean;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  isValidContract: boolean;
  isCorrectNetwork: boolean;
  isAdmin: boolean;
  contractAddress: Address | null;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  basicTierPrice: bigint;
  tknPaymentDiscount: bigint;
  adminRights: string[];
  lastActivity: Date | null;
  owner: Address | null;
  paused: boolean;
  pauseAvailable: boolean;
  transferOwnership: (newOwner: Address) => Promise<void>;
  pause: () => Promise<void>;
  unpause: () => Promise<void>;
  setNewOwnerAddress: (address: string) => void;
  handlePause: () => Promise<void>;
  handleUnpause: () => Promise<void>;
  handleWithdrawFees: () => Promise<void>;
  handleTransferOwnership: (newOwner: string) => Promise<void>;
  handleRetryCheck: () => void;
}

interface NetworkCheckResult {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  networkName?: string;
  requiredNetwork: string;
}

interface ContractCheckResult {
  isValid: boolean;
  address?: Address;
  isDeployed: boolean;
  version?: string;
  error?: string;
}

interface WalletCheckResult {
  isConnected: boolean;
  currentAddress?: string;
}

interface TokenInfo {
  tokenAddress: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
  owner: Address;
  creationTime: bigint;
  additionalTaxRate: bigint;
}

interface PlanStatsMap {
  [key: number]: {
    id: number;
    name: string;
    price: bigint;
  };
}

const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

export function useTokenForgeAdmin(): TokenForgeAdminHookReturn {
  // États
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [networkCheck, setNetworkCheck] = useState<NetworkCheckResult>({
    isConnected: false,
    isCorrectNetwork: false,
    networkName: undefined,
    requiredNetwork: 'Sepolia'
  });
  const [contractCheck, setContractCheck] = useState<ContractCheckResult>({
    isValid: false,
    address: undefined,
    isDeployed: false,
    version: undefined
  });

  // Hooks Wagmi
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { contractAddress: contextContractAddress } = useContract();

  // Vérification et initialisation de l'adresse du contrat
  const contractAddress = useMemo(() => {
    const address = contextContractAddress || TOKEN_FORGE_ADDRESS;
    console.log('Initialisation adresse du contrat:', {
      contextContractAddress,
      TOKEN_FORGE_ADDRESS,
      finalAddress: address
    });
    
    if (!address) {
      console.error('Adresse du contrat non définie');
      return undefined;
    }

    return address as `0x${string}`;
  }, [contextContractAddress]);

  // Constantes du contrat (hardcodées car ce sont des constantes Solidity)
  const BASIC_TIER_PRICE = 100n * BigInt(10 ** 18); // 100 TKN
  const TKN_PAYMENT_DISCOUNT = 2000n; // 20% (en basis points)

  // Vérification du réseau
  const isCorrectNetwork = useMemo(() => {
    if (!chain || !isConnected) return false;
    return chain.id === 11155111; // Sepolia
  }, [chain, isConnected]);

  // Contract reads avec gestion d'erreur et enabled
  const { 
    data: ownerData,
    isLoading: isOwnerLoading,
    error: ownerError
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'owner',
    enabled: Boolean(contractAddress) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Erreur lecture propriétaire:', {
        error,
        contractAddress,
        isConnected,
        isCorrectNetwork,
        chainId: chain?.id
      });
    }
  }) as { data: Address | undefined; isLoading: boolean; error: Error | null };

  const {
    data: pausedData,
    isLoading: isPausedLoading,
    error: pausedError
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'paused',
    enabled: Boolean(contractAddress) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Erreur lecture pause:', {
        error,
        contractAddress,
        isConnected,
        chainId: chain?.id
      });
    }
  }) as { data: boolean | undefined; isLoading: boolean; error: Error | null };

  const {
    data: tokenCountData,
    isLoading: isTokenCountLoading,
    error: tokenCountError,
    refetch: refetchTokenCount
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getTokenCount',
    enabled: Boolean(contractAddress) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Erreur lecture nombre de tokens:', {
        error,
        contractAddress,
        isConnected,
        isCorrectNetwork,
        chainId: chain?.id
      });
    }
  }) as { data: bigint | undefined; isLoading: boolean; error: Error | null; refetch: () => Promise<any> };

  const {
    data: allTokensData,
    isLoading: isAllTokensLoading,
    error: allTokensError,
    refetch: refetchAllTokens
  } = useContractRead({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'getAllTokens',
    enabled: Boolean(contractAddress) && isConnected && isCorrectNetwork && !tokenCountError && tokenCountData !== undefined && tokenCountData > 0n,
    onError: (error) => {
      console.error('Erreur lecture tous les tokens:', {
        error,
        contractAddress,
        isConnected,
        isCorrectNetwork,
        chainId: chain?.id,
        tokenCount: tokenCountData
      });
    }
  }) as { data: TokenInfo[] | undefined; isLoading: boolean; error: Error | null; refetch: () => Promise<any> };

  // Vérification de base de la connexion et du réseau
  const checkBaseRequirements = useCallback(() => {
    if (!contractAddress || !isConnected || !isCorrectNetwork) {
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
  }, [contractAddress, isConnected, isCorrectNetwork, address]);

  // Vérification des droits admin avec plus de détails
  const isAdmin = useMemo(() => {
    console.log('Vérification des droits admin:', {
      address: address,
      ownerData: ownerData,
      isConnected: isConnected,
      isCorrectNetwork: isCorrectNetwork,
      targetAddress: contractAddress
    });

    if (!address || !ownerData || !isConnected || !isCorrectNetwork) {
      console.log('Conditions non remplies pour les droits admin:', {
        hasAddress: !!address,
        hasOwnerData: !!ownerData,
        isConnected: isConnected,
        isCorrectNetwork: isCorrectNetwork
      });
      return false;
    }

    const hasAdminRights = address.toLowerCase() === ownerData.toLowerCase();
    console.log('Résultat vérification admin:', {
      hasAdminRights,
      userAddress: address.toLowerCase(),
      ownerAddress: ownerData.toLowerCase()
    });

    return hasAdminRights;
  }, [address, ownerData, isConnected, isCorrectNetwork, contractAddress]);

  // Vérification des droits admin
  const checkAdminAccess = useCallback(async () => {
    try {
      // Vérifie d'abord les prérequis de base
      checkBaseRequirements();

      // Vérifie si l'utilisateur est admin
      if (!isAdmin) {
        throw new TokenForgeError(
          'Droits administrateur requis',
          TokenForgeErrorCode.NOT_ADMIN
        );
      }

      // Vérifie si le contrat est en pause
      if (pausedData) {
        throw new TokenForgeError(
          'Le contrat est en pause',
          TokenForgeErrorCode.CONTRACT_PAUSED
        );
      }

      return true;
    } catch (error) {
      console.error('Erreur vérification accès admin:', error);
      throw error;
    }
  }, [checkBaseRequirements, isAdmin, pausedData]);

  // Vérification de l'accès aux tokens (utilise les fonctions communes)
  const canAccessTokens = useMemo(() => {
    try {
      checkBaseRequirements();
      return isAdmin;
    } catch (error) {
      console.log('Échec vérification accès tokens:', error);
      return false;
    }
  }, [checkBaseRequirements, isAdmin]);

  // Contract writes avec enabled
  const { writeAsync: writePause } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'pause',
    onError: (error) => {
      console.error('Erreur lors de la pause:', error);
    }
  });

  const { writeAsync: writeUnpause } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'unpause',
    onError: (error) => {
      console.error('Erreur lors de la reprise:', error);
    }
  });

  const { writeAsync: writeWithdrawFees } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'withdrawFees',
    onError: (error) => {
      console.error('Erreur lors du retrait:', error);
    }
  });

  const { writeAsync: writeTransferOwnership } = useContractWrite({
    address: contractAddress,
    abi: TokenForgeFactoryABI.abi,
    functionName: 'transferOwnership',
    onError: (error) => {
      console.error('Erreur lors du transfert:', error);
    }
  });

  // Effet pour gérer l'état de chargement global
  useEffect(() => {
    const loading = isOwnerLoading || isPausedLoading || isAllTokensLoading || isTokenCountLoading;
    setIsLoading(loading);
  }, [isOwnerLoading, isPausedLoading, isAllTokensLoading, isTokenCountLoading]);

  // Effet pour gérer les erreurs
  useEffect(() => {
    if (!isConnected) {
      setError("Veuillez connecter votre wallet");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Veuillez vous connecter au réseau Sepolia");
      return;
    }

    if (!contractAddress) {
      setError("Adresse du contrat non disponible");
      return;
    }

    // Vérifier si le contrat est déployé
    if (!contractCheck.isDeployed) {
      setError("Le contrat n'est pas déployé à cette adresse");
      return;
    }

    const errors = [
      ownerError,
      pausedError,
      allTokensError,
      tokenCountError
    ].filter(Boolean);

    if (errors.length > 0) {
      const errorMessage = errors[0]?.message || "Erreur lors de la lecture du contrat";
      console.error('Erreurs du contrat:', errors);
      setError(`Erreur: ${errorMessage}`);
    } else {
      setError(null);
    }
  }, [
    isConnected, 
    isCorrectNetwork, 
    contractAddress,
    contractCheck.isDeployed,
    ownerError,
    pausedError,
    allTokensError,
    tokenCountError
  ]);

  // Effet pour vérifier le réseau
  useEffect(() => {
    setNetworkCheck({
      isConnected: !!isConnected,
      isCorrectNetwork: chain?.id === 11155111,
      networkName: chain?.name,
      requiredNetwork: 'Sepolia'
    });
  }, [chain, isConnected]);

  // Effet pour vérifier le contrat
  useEffect(() => {
    const checkContract = async () => {
      if (!contractAddress) {
        setContractCheck({
          isValid: false,
          address: undefined,
          isDeployed: false,
          version: undefined,
          error: "Adresse du contrat non disponible"
        });
        return;
      }

      try {
        console.log("Vérification du contrat à l'adresse:", contractAddress);
        const code = await publicClient.getBytecode({ address: contractAddress });
        
        if (!code) {
          console.error("Le contrat n'est pas déployé à l'adresse:", contractAddress);
          setContractCheck({
            isValid: false,
            address: contractAddress,
            isDeployed: false,
            version: undefined,
            error: "Le contrat n'est pas déployé à cette adresse"
          });
          return;
        }

        // Vérifier que le code correspond au bon contrat (bytecode non vide)
        if (code.length < 4) {
          console.error("Le contrat à l'adresse ne semble pas être un TokenForgeFactory:", {
            address: contractAddress,
            codeLength: code.length
          });
          setContractCheck({
            isValid: false,
            address: contractAddress,
            isDeployed: true,
            version: undefined,
            error: "Le contrat à cette adresse n'est pas un TokenForgeFactory"
          });
          return;
        }
        
        setContractCheck({
          isValid: true,
          address: contractAddress,
          isDeployed: true,
          version: '1.0',
          error: undefined
        });
      } catch (err) {
        console.error("Erreur lors de la vérification du contrat:", {
          error: err,
          address: contractAddress,
          chainId: chain?.id
        });
        setContractCheck({
          isValid: false,
          address: undefined,
          isDeployed: false,
          version: undefined,
          error: err instanceof Error ? err.message : "Erreur lors de la vérification du contrat"
        });
      }
    };

    if (isConnected && contractAddress) {
      checkContract();
    }
  }, [contractAddress, publicClient, isConnected, chain]);

  // Fonctions de gestion des actions
  const handleError = useCallback((error: unknown, action: string) => {
    console.error(`Erreur lors de ${action}:`, {
      error,
      contractAddress,
      chainId: chain?.id,
      isConnected,
      isAdmin
    });

    let message = "";
    if (error instanceof Error) {
      if (error.message.includes("contract not deployed")) {
        message = "Le contrat n'est pas déployé à cette adresse";
      } else if (error.message.includes("execution reverted")) {
        message = "L'exécution de la fonction a échoué. Vérifiez que vous avez les droits nécessaires.";
      } else if (error.message.includes("network changed")) {
        message = "Le réseau a changé. Veuillez vous reconnecter au réseau Sepolia.";
      } else {
        message = error.message;
      }
    } else {
      message = `Une erreur est survenue lors de ${action}`;
    }

    setError(message);
  }, [contractAddress, chain, isConnected, isAdmin]);

  const handleSuccess = useCallback((message: string) => {
    setError(null);
    setSuccessMessage(message);
  }, []);

  // Fonction pour gérer la pause
  const handlePause = async () => {
    try {
      setIsPausing(true);
      await checkAdminAccess();
      
      if (!writePause) {
        throw new Error("Fonction de pause non disponible");
      }

      const tx = await writePause();
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      handleSuccess("Le contrat a été mis en pause avec succès");
    } catch (error) {
      handleError(error, "pause du contrat");
    } finally {
      setIsPausing(false);
    }
  };

  // Fonction pour gérer la reprise
  const handleUnpause = async () => {
    try {
      setIsUnpausing(true);
      await checkAdminAccess();
      
      if (!writeUnpause) {
        throw new Error("Fonction de reprise non disponible");
      }

      const tx = await writeUnpause();
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      handleSuccess("Le contrat a été réactivé avec succès");
    } catch (error) {
      handleError(error, "reprise du contrat");
    } finally {
      setIsUnpausing(false);
    }
  };

  // Fonction de retrait des frais
  const handleWithdrawFees = async () => {
    try {
      await checkAdminAccess();
      
      if (!writeWithdrawFees) {
        throw new Error("Fonction de retrait non disponible");
      }

      const tx = await writeWithdrawFees();
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      handleSuccess("Les frais ont été retirés avec succès");
    } catch (error) {
      handleError(error, "retrait des frais");
    }
  };

  // Fonction de transfert de propriété
  const handleTransferOwnership = async (newOwner: string) => {
    setIsTransferring(true);
    try {
      await checkAdminAccess();
      
      if (!writeTransferOwnership) {
        throw new Error("Fonction de transfert non disponible");
      }

      const tx = await writeTransferOwnership({ args: [newOwner as Address] });
      await publicClient.waitForTransactionReceipt({ hash: tx.hash });
      
      handleSuccess("La propriété a été transférée avec succès");
    } catch (error) {
      handleError(error, "transfert de propriété");
    } finally {
      setIsTransferring(false);
    }
  };

  // Ajouter walletCheck
  const walletCheck = useMemo(() => ({
    isConnected: !!isConnected,
    currentAddress: address || undefined
  }), [isConnected, address]);

  return {
    error,
    successMessage,
    isLoading,
    isPausing,
    isUnpausing,
    isTransferring,
    isValidContract: contractCheck.isValid,
    isCorrectNetwork,
    isAdmin,
    contractAddress: contractAddress || null,
    networkCheck: {
      isConnected: !!isConnected,
      isCorrectNetwork: chain?.id === 11155111,
      networkName: chain?.name,
      requiredNetwork: 'Sepolia'
    },
    contractCheck: {
      isValid: contractCheck.isValid,
      address: contractAddress,
      isDeployed: contractCheck.isDeployed,
      version: contractCheck.version,
      error: contractCheck.error
    },
    walletCheck: {
      isConnected: !!isConnected,
      currentAddress: address
    },
    basicTierPrice: BASIC_TIER_PRICE,
    tknPaymentDiscount: TKN_PAYMENT_DISCOUNT,
    adminRights: [], // TODO: Implémenter les droits d'admin
    lastActivity: null, // TODO: Implémenter le suivi d'activité
    owner: ownerData || null,
    paused: pausedData || false,
    pauseAvailable: Boolean(writePause),
    transferOwnership: handleTransferOwnership,
    pause: handlePause,
    unpause: handleUnpause,
    setNewOwnerAddress: (address: string) => {
      // TODO: Implémenter la mise à jour de l'adresse du propriétaire
    },
    handlePause,
    handleUnpause,
    handleWithdrawFees,
    handleTransferOwnership,
    handleRetryCheck: () => {
      setError(null);
      setSuccessMessage(null);
    }
  };
}
