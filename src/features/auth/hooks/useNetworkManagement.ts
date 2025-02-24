import { useCallback, useState } from 'react';
import { WalletClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { createAuthError } from '../errors/AuthError';
import { AUTH_ERROR_CODES } from '../errors/AuthError';

export const SUPPORTED_NETWORKS = {
  [mainnet.id]: {
    chainId: `0x${mainnet.id.toString(16)}`,
    chainName: mainnet.name,
    nativeCurrency: mainnet.nativeCurrency,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
    blockExplorerUrls: [mainnet.blockExplorers?.default.url],
  },
  [sepolia.id]: {
    chainId: `0x${sepolia.id.toString(16)}`,
    chainName: sepolia.name,
    nativeCurrency: sepolia.nativeCurrency,
    rpcUrls: [sepolia.rpcUrls.default.http[0]],
    blockExplorerUrls: [sepolia.blockExplorers?.default.url],
  },
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_NETWORKS;

interface NetworkState {
  isChanging: boolean;
  error: Error | null;
  lastAttemptedChainId: SupportedChainId | null;
}

export const useNetworkManagement = (walletClient: WalletClient | null) => {
  const [state, setState] = useState<NetworkState>({
    isChanging: false,
    error: null,
    lastAttemptedChainId: null,
  });

  const switchNetwork = useCallback(async (targetChainId: SupportedChainId) => {
    if (!walletClient || !window.ethereum) {
      setState(prev => ({
        ...prev,
        error: createAuthError(
          AUTH_ERROR_CODES.PROVIDER_NOT_FOUND,
          'No provider available for network switching'
        ),
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isChanging: true,
      lastAttemptedChainId: targetChainId,
      error: null,
    }));

    try {
      // D'abord, essayons de changer de réseau
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SUPPORTED_NETWORKS[targetChainId].chainId }],
      });

      setState(prev => ({
        ...prev,
        isChanging: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      // Code 4902 signifie que le réseau n'existe pas encore
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SUPPORTED_NETWORKS[targetChainId]],
          });

          setState(prev => ({
            ...prev,
            isChanging: false,
            error: null,
          }));

          return true;
        } catch (addError) {
          setState(prev => ({
            ...prev,
            isChanging: false,
            error: createAuthError(
              AUTH_ERROR_CODES.PROVIDER_ERROR,
              'Failed to add network',
              { originalError: addError }
            ),
          }));
          return false;
        }
      }

      setState(prev => ({
        ...prev,
        isChanging: false,
        error: createAuthError(
          AUTH_ERROR_CODES.NETWORK_MISMATCH,
          'Failed to switch network',
          { originalError: error }
        ),
      }));
      return false;
    }
  }, [walletClient]);

  const ensureNetwork = useCallback(async (requiredChainId: SupportedChainId) => {
    if (!walletClient) return false;

    try {
      const chainId = await walletClient.getChainId();

      if (chainId !== requiredChainId) {
        return await switchNetwork(requiredChainId);
      }

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: createAuthError(
          AUTH_ERROR_CODES.PROVIDER_ERROR,
          'Failed to check network',
          { originalError: error }
        ),
      }));
      return false;
    }
  }, [walletClient, switchNetwork]);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    switchNetwork,
    ensureNetwork,
    resetError,
    supportedNetworks: SUPPORTED_NETWORKS,
  };
};
