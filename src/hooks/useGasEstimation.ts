import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '/useNetwork';
import { GasEstimationService, GasEstimate, TokenDeploymentEstimate } from '@/core/services/GasEstimationService';
import { NetworkConfig } from '@/config/networks';
import { getDefaultNetworkConfig } from '@/config/networks';

interface UseGasEstimationReturn {
  gasEstimate: GasEstimate | null;
  deploymentEstimate: TokenDeploymentEstimate | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGasEstimation(
  refreshInterval = 15000 // 15 secondes par défaut
): UseGasEstimationReturn {
  const { chain } = useNetwork();
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [deploymentEstimate, setDeploymentEstimate] = useState<TokenDeploymentEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getNetworkConfig = useCallback((chainId: number): NetworkConfig => {
    // Convertir la chaîne wagmi en notre format NetworkConfig
    const defaultConfig = getDefaultNetworkConfig(chainId);
    if (!defaultConfig) {
      throw new Error(`Network configuration not found for chain ID ${chainId}`);
    }
    return defaultConfig;
  }, []);

  const fetchEstimates = useCallback(async () => {
    if (!chain) {
      setError('No chain selected');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const networkConfig = getNetworkConfig(chain.id);

      // Récupérer l'estimation du gas
      const gasEstimate = await GasEstimationService.getGasEstimate(networkConfig);
      setGasEstimate(gasEstimate);

      // Calculer l'estimation pour le déploiement
      const deploymentEstimate = await GasEstimationService.estimateTokenDeployment(
        networkConfig,
        gasEstimate
      );
      setDeploymentEstimate(deploymentEstimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gas estimates');
    } finally {
      setIsLoading(false);
    }
  }, [chain, getNetworkConfig]);

  // Effet pour le chargement initial et le rafraîchissement périodique
  useEffect(() => {
    fetchEstimates();

    // Configurer le rafraîchissement périodique
    const interval = setInterval(fetchEstimates, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [fetchEstimates, refreshInterval]);

  // Effet pour recharger lors du changement de réseau
  useEffect(() => {
    if (chain) {
      fetchEstimates();
    }
  }, [chain, fetchEstimates]);

  return {
    gasEstimate,
    deploymentEstimate,
    isLoading,
    error,
    refetch: fetchEstimates
  };
}
