import { useState, useCallback } from 'react';
import { usePublicClient, useNetwork } from 'wagmi';
import { Chain } from 'viem';

export interface NetworkConfig {
  chainId: number;
  name: string;
  isTestnet: boolean;
  explorerUrl: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const useNetworkManagement = () => {
  const { chain, chains } = useNetwork();
  const publicClient = usePublicClient();
  const [isSwitching, setIsSwitching] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Convert wagmi chain to our NetworkConfig format
  const mapChainToConfig = useCallback((chain: Chain): NetworkConfig => {
    return {
      chainId: chain.id,
      name: chain.name,
      isTestnet: chain.testnet || false,
      explorerUrl: chain.blockExplorers?.default.url || '',
      rpcUrl: chain.rpcUrls.default.http[0],
      currency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol,
        decimals: chain.nativeCurrency.decimals,
      },
    };
  }, []);

  // Get current network configuration
  const currentNetwork = chain ? mapChainToConfig(chain) : null;

  // Get available networks
  const availableNetworks = chains.map(mapChainToConfig);

  // Switch network with error handling
  const handleNetworkSwitch = useCallback(async (chainId: number) => {
    try {
      setIsSwitching(true);
      setNetworkError(null);
      
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // Si le réseau n'existe pas, on essaie de l'ajouter
          if (switchError.code === 4902) {
            const network = availableNetworks.find(n => n.chainId === chainId);
            if (network) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: network.currency,
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.explorerUrl],
                }],
              });
            }
          } else {
            throw switchError;
          }
        }
      } else {
        throw new Error('No Ethereum provider available');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      setNetworkError(errorMessage);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [availableNetworks]);

  // Check if current network is supported
  const isNetworkSupported = useCallback((chainId: number) => {
    return availableNetworks.some(network => network.chainId === chainId);
  }, [availableNetworks]);

  // Clear network error
  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);

  return {
    currentNetwork,
    availableNetworks,
    isNetworkSupported,
    switchNetwork: handleNetworkSwitch,
    isSwitching,
    networkError,
    clearNetworkError,
  };
};

export default useNetworkManagement;
