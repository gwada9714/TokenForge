import { useState, useEffect } from 'react';
import { createWalletClient, custom, WalletClient, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

export const useWeb3Provider = () => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    // Créer un wallet client pour interagir avec le wallet
    const client = createWalletClient({
      chain: mainnet,
      transport: custom(window.ethereum)
    });
    setWalletClient(client);

    // Créer un public client pour les lectures de chaîne
    const public_client = createPublicClient({
      chain: mainnet,
      transport: http()
    });
    setPublicClient(public_client);
  }, []);

  return { walletClient, publicClient };
};