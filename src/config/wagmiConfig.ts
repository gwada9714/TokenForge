import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// Récupération des variables d'environnement avec valeurs par défaut pour le développement
function getEnvVariable(key: string, required: boolean = true): string {
  const value = import.meta.env[key];
  if (!value && required) {
    throw new Error(`Error: ${key} is required but not defined in environment variables`);
  }
  return value || '';
}

// Configuration des fournisseurs avec CORS
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    alchemyProvider({
      apiKey: getEnvVariable('VITE_ALCHEMY_API_KEY', true),
    }),
    publicProvider()
  ],
  {
    batch: {
      multicall: {
        wait: 16,
        batchSize: 1024 * 1024,
      },
    },
    pollingInterval: 4_000,
    retryCount: 3,
    retryDelay: 3_000,
  }
);

// Configuration du portefeuille
const { connectors } = getDefaultWallets({
  appName: 'TokenForge',
  projectId: getEnvVariable('VITE_WALLET_CONNECT_PROJECT_ID', true),
  chains,
});

// Création de la configuration wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { wagmiConfig, chains };