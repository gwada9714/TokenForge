import { useState, useEffect } from 'react';
import { useChainId, useConfig } from 'wagmi';
import type { Chain } from 'wagmi/chains';
import { type NetworkConfig, networks } from '../config/networks';

interface NetworkHookResult {
  chain: Chain | undefined;
  chains: readonly Chain[];
  network: NetworkConfig | null;
}

export function useNetwork(): NetworkHookResult {
  const chainId = useChainId();
  const config = useConfig();
  
  const chain = config.chains.find((c: Chain) => c.id === chainId);
  const network: NetworkConfig | null = chainId ? networks[chainId] : null;

  return { 
    chain,
    chains: config.chains,
    network 
  };
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
}

export const useNetwork = () => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig | null>(null);

  useEffect(() => {
    // Logique pour détecter et gérer le réseau actuel
    const detectNetwork = async () => {
      try {
        // Implémentation à compléter selon vos besoins
      } catch (error) {
        console.error('Erreur lors de la détection du réseau:', error);
      }
    };

    detectNetwork();
  }, []);

  return {
    network: currentNetwork,
    // Autres fonctions utiles à ajouter selon les besoins
  };
};

export default useNetwork;
