import { useState, useCallback } from 'react';
import { createTokenService } from '../factory';
import { TokenConfig, DeploymentResult, ValidationResult } from '../types';

/**
 * Hook React pour la création de tokens
 * Permet de créer des tokens sur différentes blockchains
 * 
 * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, etc.)
 * @param walletProvider Provider du wallet (window.ethereum, etc.)
 * @returns Fonctions et états pour la création de tokens
 */
export const useTokenCreation = (chainName: string, walletProvider?: any) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<bigint | null>(null);

  // Valider la configuration du token
  const validateToken = useCallback(async (tokenConfig: TokenConfig) => {
    setError(null);
    try {
      const tokenService = createTokenService(chainName, walletProvider);
      const result = tokenService.validateTokenConfig(tokenConfig);
      setValidationResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setValidationResult({ valid: false, errors: [errorMessage] });
      return { valid: false, errors: [errorMessage] };
    }
  }, [chainName, walletProvider]);

  // Estimer le coût de déploiement
  const estimateDeploymentCost = useCallback(async (tokenConfig: TokenConfig) => {
    setError(null);
    try {
      const tokenService = createTokenService(chainName, walletProvider);
      const cost = await tokenService.estimateDeploymentCost(tokenConfig);
      setEstimatedCost(cost);
      return cost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [chainName, walletProvider]);

  // Déployer le token
  const deployToken = useCallback(async (tokenConfig: TokenConfig) => {
    setError(null);
    setIsDeploying(true);
    try {
      // Valider d'abord la configuration
      const validation = await validateToken(tokenConfig);
      if (!validation.valid) {
        setIsDeploying(false);
        return null;
      }

      const tokenService = createTokenService(chainName, walletProvider);
      const result = await tokenService.deployToken(tokenConfig);
      setDeploymentResult(result);
      setIsDeploying(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsDeploying(false);
      return null;
    }
  }, [chainName, walletProvider, validateToken]);

  // Configurer la liquidité automatique
  const setupAutoLiquidity = useCallback(async (tokenAddress: string, pairWith: string, amount: bigint, lockPeriod?: number) => {
    setError(null);
    try {
      const tokenService = createTokenService(chainName, walletProvider);
      const result = await tokenService.setupAutoLiquidity(tokenAddress, {
        pairWith,
        initialLiquidityAmount: amount,
        lockPeriod
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  }, [chainName, walletProvider]);

  return {
    validateToken,
    estimateDeploymentCost,
    deployToken,
    setupAutoLiquidity,
    isDeploying,
    deploymentResult,
    validationResult,
    estimatedCost,
    error
  };
};
