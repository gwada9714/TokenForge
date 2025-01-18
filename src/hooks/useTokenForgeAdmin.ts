import { useAccount, useNetwork, usePublicClient, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi';
import { Address } from 'viem';
import { TokenForgeError, TokenForgeErrorCode } from '../utils/errors';
import TokenForgeFactory from '../contracts/abi/TokenForgeFactory.json';
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
  const { contractAddress } = useContract();

  // Vérifier si le contrat est valide
  const targetAddress = useMemo(() => {
    if (!contractAddress && !TOKEN_FORGE_ADDRESS) {
      console.error("Erreur d'adresse du contrat:", {
        contractAddress,
        TOKEN_FORGE_ADDRESS,
        chain: chain?.id
      });
      setError("Adresse du contrat non disponible");
      return undefined;
    }
    const address = (contractAddress || TOKEN_FORGE_ADDRESS) as `0x${string}`;
    console.log("Adresse du contrat utilisée:", {
      address,
      source: contractAddress ? "ContractContext" : "TOKEN_FORGE_ADDRESS"
    });
    return address;
  }, [contractAddress, chain]);

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
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'owner',
    enabled: Boolean(targetAddress) && isConnected && isCorrectNetwork,
    onError: (error) => {
      console.error('Erreur lors de la lecture du propriétaire:', {
        error,
        targetAddress,
        isConnected,
        isCorrectNetwork,
        chainId: chain?.id
      });
      handleError(error, "lecture du propriétaire");
    }
  }) as { data: Address | undefined; isLoading: boolean; error: Error | null };

  const {
    data: pausedData,
    isLoading: isPausedLoading,
    error: pausedError
  } = useContractRead({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'paused',
    enabled: Boolean(targetAddress) && isConnected && isCorrectNetwork && !ownerError,
    onError: (error) => {
      console.error('Erreur lors de la lecture du statut pause:', {
        error,
        targetAddress,
        isConnected,
        isCorrectNetwork,
        chainId: chain?.id,
        ownerError
      });
      handleError(error, "lecture du statut pause");
    }
  }) as { data: boolean | undefined; isLoading: boolean; error: Error | null };

  const {
    data: allTokensData,
    isLoading: isAllTokensLoading,
    error: allTokensError
  } = useContractRead({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'getAllTokens',
    enabled: Boolean(targetAddress) && isConnected && isCorrectNetwork && !ownerError && !pausedError && pausedData === false,
    onError: (error) => {
      console.error('Erreur lors de la lecture des tokens:', error);
      handleError(error, "lecture des tokens");
    }
  }) as { data: TokenInfo[] | undefined; isLoading: boolean; error: Error | null };

  // Vérifications de l'accès admin
  const checkAdminAccess = useCallback(async () => {
    if (!isConnected) {
      throw new Error("Wallet non connecté");
    }

    if (!isCorrectNetwork) {
      throw new Error("Veuillez vous connecter au réseau Sepolia");
    }

    if (!targetAddress) {
      throw new Error("Adresse du contrat non disponible");
    }

    if (!ownerData) {
      throw new Error("Impossible de récupérer l'adresse du propriétaire");
    }

    if (!address) {
      throw new Error("Adresse du wallet non disponible");
    }

    if (address.toLowerCase() !== ownerData.toLowerCase()) {
      throw new Error("Vous n'avez pas les droits d'administrateur");
    }

    // Vérifier si le contrat est en pause
    if (pausedData) {
      throw new Error("Le contrat est en pause");
    }
  }, [isConnected, isCorrectNetwork, targetAddress, ownerData, address, pausedData]);

  // Valeurs dérivées avec gestion des erreurs
  const isAdmin = useMemo(() => {
    if (!address || !ownerData || !isConnected || !isCorrectNetwork) return false;
    return address.toLowerCase() === ownerData.toLowerCase();
  }, [address, ownerData, isConnected, isCorrectNetwork]);

  const isValidContract = useMemo(() => {
    if (!targetAddress || !isConnected || !isCorrectNetwork) return false;
    if (ownerError) return false;
    return Boolean(ownerData); // Le contrat est valide si on a pu lire le propriétaire
  }, [targetAddress, isConnected, isCorrectNetwork, ownerError, ownerData]);

  // Contract writes avec enabled
  const { writeAsync: writePause } = useContractWrite({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'pause',
    onError: (error) => {
      console.error('Erreur lors de la pause:', error);
      handleError(error, "pause");
    }
  });

  const { writeAsync: writeUnpause } = useContractWrite({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'unpause',
    onError: (error) => {
      console.error('Erreur lors de la reprise:', error);
      handleError(error, "reprise");
    }
  });

  const { writeAsync: writeWithdrawFees } = useContractWrite({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'withdrawFees',
    onError: (error) => {
      console.error('Erreur lors du retrait:', error);
      handleError(error, "retrait");
    }
  });

  const { writeAsync: writeTransferOwnership } = useContractWrite({
    address: targetAddress,
    abi: TokenForgeFactory.abi,
    functionName: 'transferOwnership',
    onError: (error) => {
      console.error('Erreur lors du transfert:', error);
      handleError(error, "transfert");
    }
  });

  // Effet pour gérer l'état de chargement global
  useEffect(() => {
    const loading = isOwnerLoading || isPausedLoading || isAllTokensLoading;
    setIsLoading(loading);
  }, [isOwnerLoading, isPausedLoading, isAllTokensLoading]);

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

    if (!targetAddress) {
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
      allTokensError
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
    targetAddress,
    contractCheck.isDeployed,
    ownerError,
    pausedError,
    allTokensError
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
      if (!targetAddress) {
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
        console.log("Vérification du contrat à l'adresse:", targetAddress);
        const code = await publicClient.getBytecode({ address: targetAddress });
        
        if (!code) {
          console.error("Le contrat n'est pas déployé à l'adresse:", targetAddress);
          setContractCheck({
            isValid: false,
            address: targetAddress,
            isDeployed: false,
            version: undefined,
            error: "Le contrat n'est pas déployé à cette adresse"
          });
          return;
        }

        // Vérifier que le code correspond au bon contrat (bytecode non vide)
        if (code.length < 4) {
          console.error("Le contrat à l'adresse ne semble pas être un TokenForgeFactory:", {
            address: targetAddress,
            codeLength: code.length
          });
          setContractCheck({
            isValid: false,
            address: targetAddress,
            isDeployed: true,
            version: undefined,
            error: "Le contrat à cette adresse n'est pas un TokenForgeFactory"
          });
          return;
        }
        
        setContractCheck({
          isValid: true,
          address: targetAddress,
          isDeployed: true,
          version: '1.0',
          error: undefined
        });
      } catch (err) {
        console.error("Erreur lors de la vérification du contrat:", {
          error: err,
          address: targetAddress,
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

    if (isConnected && targetAddress) {
      checkContract();
    }
  }, [targetAddress, publicClient, isConnected, chain]);

  // Fonctions de gestion des actions
  const handleError = useCallback((error: unknown, action: string) => {
    console.error(`Erreur lors de ${action}:`, {
      error,
      targetAddress,
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
  }, [targetAddress, chain, isConnected, isAdmin]);

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
    isValidContract,
    isCorrectNetwork,
    isAdmin,
    contractAddress: targetAddress || null,
    networkCheck: {
      isConnected: !!isConnected,
      isCorrectNetwork: chain?.id === 11155111,
      networkName: chain?.name,
      requiredNetwork: 'Sepolia'
    },
    contractCheck: {
      isValid: isValidContract,
      address: targetAddress,
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
