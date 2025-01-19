import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { createAuthError } from '../errors/AuthError';
import { mainnet, sepolia } from '../../../config/chains';

// Type explicite pour les chaînes supportées
const SUPPORTED_CHAIN_IDS = [mainnet.id, sepolia.id] as const;
type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number];

interface WalletState {
  provider: BrowserProvider | null;
  account: string | null;
  chainId: SupportedChainId | null;
  isConnecting: boolean;
  error: Error | null;
}

export const useWalletDetection = () => {
  const [state, setState] = useState<WalletState>({
    provider: null,
    account: null,
    chainId: null,
    isConnecting: true,
    error: null,
  });

  const detectProvider = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: createAuthError(
          'AUTH_001',
          'No Web3 provider detected. Please install MetaMask or another Web3 wallet.'
        ),
      }));
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum, 'any');
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (!signerAddress) {
        setState(prev => ({
          ...prev,
          provider,
          isConnecting: false,
        }));
        return;
      }

      if (!SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId)) {
        setState(prev => ({
          ...prev,
          provider,
          isConnecting: false,
          error: createAuthError(
            'AUTH_002',
            'Unsupported network. Please switch to a supported network.',
            { chainId }
          ),
        }));
        return;
      }

      setState({
        provider,
        account: signerAddress,
        chainId: chainId as SupportedChainId,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: createAuthError(
          'AUTH_009',
          'Failed to connect to wallet provider',
          { originalError: error }
        ),
      }));
    }
  }, []);

  useEffect(() => {
    detectProvider();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', detectProvider);
      window.ethereum.on('chainChanged', detectProvider);
      window.ethereum.on('disconnect', () => {
        setState(prev => ({
          ...prev,
          account: null,
          error: createAuthError(
            'AUTH_008',
            'Wallet disconnected'
          ),
        }));
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', detectProvider);
        window.ethereum.removeListener('chainChanged', detectProvider);
      };
    }
  }, [detectProvider]);

  return state;
};
