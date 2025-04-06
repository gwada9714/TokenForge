import { useState, useCallback } from 'react';
import { TokenDeploymentService } from '../services/tokenDeploymentService';
import { BlockchainNetwork } from '../components/DeploymentOptions';
import { useTokenForgeAuth } from '@/hooks/useAuth';
import { useWalletState } from '@/features/auth/hooks/useWalletState';

interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  mintable: boolean;
  burnable: boolean;
  blacklist: boolean;
  customTaxPercentage: number;
}

interface DeploymentState {
  isDeploying: boolean;
  error: string | null;
  tokenAddress: string | null;
  transactionHash: string | null;
}

export const useTokenDeployment = () => {
  const [state, setState] = useState<DeploymentState>({
    isDeploying: false,
    error: null,
    tokenAddress: null,
    transactionHash: null
  });

  const { isAuthenticated } = useTokenForgeAuth();
  const { address: walletAddress } = useWalletState();
  const deploymentService = new TokenDeploymentService();

  const deployToken = useCallback(async (
    network: BlockchainNetwork,
    config: TokenConfig
  ) => {
    if (!isAuthenticated || !walletAddress) {
      setState(prev => ({
        ...prev,
        error: 'Wallet non connecté ou authentification requise'
      }));
      return false;
    }

    setState(prev => ({ ...prev, isDeploying: true, error: null }));

    try {
      const result = await deploymentService.deployToken(
        network,
        {
          ...config,
          initialSupply: BigInt(config.initialSupply)
        },
        walletAddress
      );

      if (!result.success) {
        throw new Error(result.error || 'Échec du déploiement');
      }

      setState(prev => ({
        ...prev,
        isDeploying: false,
        tokenAddress: result.tokenAddress || null,
        transactionHash: result.transactionHash || null
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isDeploying: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
      return false;
    }
  }, [isAuthenticated, walletAddress]);

  const resetState = useCallback(() => {
    setState({
      isDeploying: false,
      error: null,
      tokenAddress: null,
      transactionHash: null
    });
  }, []);

  return {
    ...state,
    deployToken,
    resetState
  };
};
