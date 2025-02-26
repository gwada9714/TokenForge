import { useState, useEffect, useCallback } from 'react';
import { createWalletClient, custom, formatEther } from 'viem';
import { mainnet } from 'viem/chains';

interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: null,
    isConnected: false,
  });

  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Veuillez installer MetaMask');
      return;
    }

    try {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      const [address] = await client.requestAddresses();
      const chainId = await client.getChainId();
      const balance = formatEther(await client.getBalance({ address }));

      setWallet({
        address,
        chainId,
        balance,
        isConnected: true,
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors de la connexion au wallet');
      console.error('Erreur de connexion:', err);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      balance: null,
      isConnected: false,
    });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectWallet();
      });

      window.ethereum.on('chainChanged', () => {
        connectWallet();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connectWallet);
        window.ethereum.removeListener('chainChanged', connectWallet);
      }
    };
  }, [connectWallet]);

  return {
    wallet,
    error,
    connectWallet,
    disconnectWallet,
  };
}; 