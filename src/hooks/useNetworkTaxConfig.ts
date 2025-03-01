import { useEffect, useState } from 'react';
import { useNetwork } from './useNetwork';
import { NetworkTaxConfig } from '@/types/network';
import { ethers } from 'ethers';

const DEFAULT_TAX_CONFIG: NetworkTaxConfig = {
  chainId: 1,
  baseTaxRate: 0.5,
  maxAdditionalTaxRate: 1.5,
  minTokenAmount: ethers.parseEther('1000').toString(), // 1000 tokens minimum
  deploymentCost: {
    estimated: ethers.parseEther('0.01').toString(),
    currency: 'ETH'
  },
  taxCollector: '0x...' // à remplacer par l'adresse réelle du contrat
};

const NETWORK_TAX_CONFIGS: { [chainId: number]: NetworkTaxConfig } = {
  1: { // Ethereum
    ...DEFAULT_TAX_CONFIG,
    chainId: 1,
    deploymentCost: {
      estimated: ethers.parseEther('0.05').toString(),
      currency: 'ETH'
    }
  },
  56: { // BSC
    ...DEFAULT_TAX_CONFIG,
    chainId: 56,
    deploymentCost: {
      estimated: ethers.parseEther('0.01').toString(),
      currency: 'BNB'
    }
  },
  137: { // Polygon
    ...DEFAULT_TAX_CONFIG,
    chainId: 137,
    deploymentCost: {
      estimated: ethers.parseEther('50').toString(),
      currency: 'MATIC'
    }
  },
  43114: { // Avalanche
    ...DEFAULT_TAX_CONFIG,
    chainId: 43114,
    deploymentCost: {
      estimated: ethers.parseEther('0.1').toString(),
      currency: 'AVAX'
    }
  }
};

export const useNetworkTaxConfig = () => {
  const { chain } = useNetwork();
  const [taxConfig, setTaxConfig] = useState<NetworkTaxConfig>(DEFAULT_TAX_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaxConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!chain?.id) {
          throw new Error('No chain selected');
        }

        // Récupérer la configuration de taxe pour le réseau actuel
        const networkConfig = NETWORK_TAX_CONFIGS[chain.id];
        if (!networkConfig) {
          throw new Error('Unsupported network');
        }

        // TODO: Charger les estimations de gas en temps réel depuis l'API
        // const gasEstimates = await fetchGasEstimates(chain.id);
        
        setTaxConfig(networkConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tax configuration');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaxConfig();
  }, [chain?.id]);

  const formatCost = (wei: string, currency: string) => {
    const formatted = ethers.formatEther(wei);
    return `${formatted} ${currency}`;
  };

  return {
    taxConfig,
    isLoading,
    error,
    formatCost,
    isSupported: chain?.id ? !!NETWORK_TAX_CONFIGS[chain.id] : false
  };
};
