import { useEffect, useState } from 'react';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

/**
 * Hook personnalisé pour obtenir la configuration wagmi unifiée
 * Cette approche permet de s'assurer que toute l'application utilise la même configuration
 */
export function useWagmiConfig() {
  const [config, setConfig] = useState<ReturnType<typeof getDefaultConfig> | null>(null);

  useEffect(() => {
    try {
      // Récupération des variables d'environnement
      const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'wallet-connect-project-id';

      // Configuration des chaînes supportées avec des transports publics
      const supportedChains = [sepolia, mainnet] as const;

      // Configuration Wagmi avec RainbowKit
      const wagmiConfig = getDefaultConfig({
        appName: 'TokenForge',
        projectId: projectId,
        chains: supportedChains,
        transports: {
          // Utilisation de RPCs publics pour éviter les erreurs 401
          [mainnet.id]: http(),
          [sepolia.id]: http(),
        },
        ssr: false // Désactive le SSR pour éviter les problèmes de rendu
      });

      setConfig(wagmiConfig);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la configuration wagmi:', error);
    }
  }, []);

  return config;
}

// Exporter également une version synchrone pour les cas où le hook ne peut pas être utilisé
export const getWagmiConfig = () => {
  try {
    // Récupération des variables d'environnement
    const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'wallet-connect-project-id';

    // Configuration des chaînes supportées
    const supportedChains = [sepolia, mainnet] as const;

    // Configuration Wagmi avec RainbowKit
    return getDefaultConfig({
      appName: 'TokenForge',
      projectId: projectId,
      chains: supportedChains,
      transports: {
        // Utilisation de RPCs publics pour éviter les erreurs 401
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
      ssr: false // Désactive le SSR pour éviter les problèmes de rendu
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la configuration wagmi:', error);
    throw error;
  }
};

export default getWagmiConfig;
