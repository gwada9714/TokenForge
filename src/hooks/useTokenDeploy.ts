import { useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { CUSTOM_ERC20_ABI } from '../contracts/CustomERC20';
import { bytecode } from '../contracts/bytecode';
import { useTokenForgeAuth } from '@/hooks/useAuth';
import { logger } from '@/core/logger';

interface TokenDeployParams {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals: number;
  isMintable: boolean;
  isBurnable: boolean;
  simulate?: boolean; // Option pour simuler le déploiement sans réellement le faire
}

interface DeploymentResult {
  success: boolean;
  hash?: `0x${string}`;
  contractAddress?: string;
  error?: string;
}

export function useTokenDeploy() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDeploymentResult, setLastDeploymentResult] = useState<DeploymentResult | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isAuthenticated, connectWallet } = useTokenForgeAuth();

  // Vérification de l'état du wallet
  const checkWalletStatus = async (): Promise<boolean> => {
    if (!walletClient) {
      if (isAuthenticated) {
        // L'utilisateur est authentifié mais le client wallet n'est pas disponible
        setError(new Error("Wallet non disponible. Vérifiez votre connexion avec MetaMask."));
        return false;
      } else {
        try {
          // Essaie de connecter le wallet
          await connectWallet();
          return true; // Si on arrive ici, la connexion a réussi
        } catch (err) {
          setError(new Error("Veuillez connecter votre wallet pour déployer un token."));
          return false;
        }
      }
    }
    return true;
  };

  // Simulation de déploiement pour le développement/tests
  const simulateDeployment = async (params: TokenDeployParams): Promise<DeploymentResult> => {
    // Attendre 2 secondes pour simuler le temps de déploiement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Générer une fausse adresse et un hash
    const fakeHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;
    const fakeAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    logger.info({
      category: 'TokenDeploy',
      message: 'Déploiement simulé',
      data: {
        ...params,
        hash: fakeHash,
        contractAddress: fakeAddress
      }
    });
    
    return {
      success: true,
      hash: fakeHash,
      contractAddress: fakeAddress
    };
  };

  const deployToken = async (params: TokenDeployParams): Promise<DeploymentResult> => {
    const { name, symbol, initialSupply, decimals, isMintable, isBurnable, simulate = false } = params;
    
    try {
      setIsDeploying(true);
      setError(null);
      setLastDeploymentResult(null);
      
      // Simulation si demandée ou en mode développement
      if (simulate || process.env.NODE_ENV === 'development') {
        logger.info({
          category: 'TokenDeploy',
          message: 'Démarrage de la simulation de déploiement',
          data: params
        });
        
        const result = await simulateDeployment(params);
        setIsSuccess(result.success);
        setLastDeploymentResult(result);
        return result;
      }
      
      // Vérification du wallet pour un déploiement réel
      const isWalletReady = await checkWalletStatus();
      if (!isWalletReady || !walletClient) {
        const result: DeploymentResult = {
          success: false,
          error: "Wallet non connecté ou non disponible"
        };
        setLastDeploymentResult(result);
        throw new Error(result.error);
      }

      // Vérifier si publicClient est défini
      if (!publicClient) {
        const result: DeploymentResult = {
          success: false,
          error: "Client blockchain non disponible"
        };
        setLastDeploymentResult(result);
        throw new Error(result.error);
      }

      logger.info({
        category: 'TokenDeploy',
        message: 'Démarrage du déploiement',
        data: {
          name, 
          symbol,
          initialSupply,
          decimals
        }
      });

      // S'assurer que isMintable et isBurnable sont bien des booléens
      const mintableBoolean = Boolean(isMintable);
      const burnableBoolean = Boolean(isBurnable);

      // Déploiement du contrat
      const hash = await walletClient.deployContract({
        abi: CUSTOM_ERC20_ABI,
        bytecode: bytecode as `0x${string}`,
        args: [name, symbol, parseEther(initialSupply), decimals, mintableBoolean, burnableBoolean],
      });

      // Attente de la confirmation de la transaction
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      const result: DeploymentResult = {
        success: true,
        hash: receipt.transactionHash,
        contractAddress: receipt.contractAddress || undefined
      };
      
      setIsSuccess(true);
      setLastDeploymentResult(result);
      
      logger.info({
        category: 'TokenDeploy',
        message: 'Déploiement réussi',
        data: {
          hash: receipt.transactionHash,
          contractAddress: receipt.contractAddress
        }
      });
      
      return result;
    } catch (err) {
      const errorObj = err as Error;
      const errorMessage = errorObj.message || 'Erreur inconnue lors du déploiement';
      
      logger.error({
        category: 'TokenDeploy',
        message: 'Erreur lors du déploiement',
        error: errorObj
      });
      
      const result: DeploymentResult = {
        success: false,
        error: errorMessage
      };
      
      setError(errorObj);
      setLastDeploymentResult(result);
      
      return result;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deployToken,
    isDeploying,
    isSuccess,
    error,
    lastDeploymentResult,
    checkWalletStatus
  };
}
