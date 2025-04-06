import { useState, useCallback } from "react";
import { createTokenService } from "../factory";
import { TokenConfig, DeploymentResult } from "../types";

/**
 * Hook React pour le déploiement de tokens
 * Permet de déployer des tokens sur différentes blockchains et de suivre leur statut
 *
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum, etc.)
 * @param walletProvider Provider du wallet (window.ethereum, etc.)
 * @returns Fonctions et états pour le déploiement de tokens
 */
export const useTokenDeployment = (chainName: string, walletProvider?: any) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [deploymentResult, setDeploymentResult] =
    useState<DeploymentResult | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);

  // Déployer un token
  const deployToken = useCallback(
    async (tokenConfig: TokenConfig): Promise<DeploymentResult | null> => {
      setIsDeploying(true);
      setDeploymentStatus("pending");
      setDeploymentProgress(10);
      setDeploymentError(null);

      try {
        const tokenService = createTokenService(chainName, walletProvider);

        // Validation de la configuration
        setDeploymentProgress(20);
        const validationResult = tokenService.validateTokenConfig(tokenConfig);
        if (!validationResult.valid) {
          throw new Error(
            `Invalid token configuration: ${validationResult.errors.join(", ")}`
          );
        }

        // Estimation du coût
        setDeploymentProgress(30);
        const cost = await tokenService.estimateDeploymentCost(tokenConfig);
        console.log(`Estimated deployment cost: ${cost}`);

        // Déploiement du token
        setDeploymentProgress(50);
        const result = await tokenService.deployToken(tokenConfig);

        // Mise à jour des états
        setTransactionHash(result.transactionHash);
        setTokenAddress(result.tokenAddress);
        setDeploymentResult(result);
        setDeploymentStatus("success");
        setDeploymentProgress(100);
        setIsDeploying(false);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error during token deployment";
        setDeploymentError(errorMessage);
        setDeploymentStatus("error");
        setDeploymentProgress(0);
        setIsDeploying(false);
        console.error("Token deployment error:", errorMessage);
        return null;
      }
    },
    [chainName, walletProvider]
  );

  // Configurer la liquidité automatique
  const setupAutoLiquidity = useCallback(
    async (
      tokenAddress: string,
      pairWithToken: string,
      amount: bigint,
      lockPeriod?: number
    ): Promise<boolean> => {
      if (!tokenAddress) {
        setDeploymentError(
          "Token address is required for auto-liquidity setup"
        );
        return false;
      }

      try {
        const tokenService = createTokenService(chainName, walletProvider);
        const result = await tokenService.setupAutoLiquidity(tokenAddress, {
          pairWith: pairWithToken,
          initialLiquidityAmount: amount,
          lockPeriod,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error during auto-liquidity setup";
        setDeploymentError(errorMessage);
        console.error("Auto-liquidity setup error:", errorMessage);
        return false;
      }
    },
    [chainName, walletProvider]
  );

  // Vérifier le statut du déploiement
  const checkDeploymentStatus = useCallback(
    async (txHash: string): Promise<boolean> => {
      if (!txHash) {
        setDeploymentError(
          "Transaction hash is required to check deployment status"
        );
        return false;
      }

      try {
        // Cette fonction dépend de l'implémentation spécifique à chaque blockchain
        // Pour l'instant, on simule une vérification réussie
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error checking deployment status";
        setDeploymentError(errorMessage);
        return false;
      }
    },
    []
  );

  // Réinitialiser l'état du déploiement
  const resetDeployment = useCallback(() => {
    setIsDeploying(false);
    setDeploymentStatus("idle");
    setDeploymentResult(null);
    setDeploymentError(null);
    setDeploymentProgress(0);
    setTransactionHash(null);
    setTokenAddress(null);
  }, []);

  return {
    deployToken,
    setupAutoLiquidity,
    checkDeploymentStatus,
    resetDeployment,
    isDeploying,
    deploymentStatus,
    deploymentResult,
    deploymentError,
    deploymentProgress,
    transactionHash,
    tokenAddress,
  };
};
