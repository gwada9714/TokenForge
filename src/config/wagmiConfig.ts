import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { configureChains, createConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { 
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Récupération des variables d'environnement avec valeurs par défaut pour le développement
function getEnvVariable(key: string, required: boolean = true): string {
  const value = import.meta.env[key];
  if (!value && required) {
    throw new Error(`Error: ${key} is required but not defined in environment variables`);
  }
  return value || '';
}

// Configuration des fournisseurs
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, mainnet], // Mettre Sepolia en premier car c'est notre réseau principal
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

// Configuration des wallets supportés
const projectId = getEnvVariable('VITE_WALLET_CONNECT_PROJECT_ID', true);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

// Création de la configuration wagmi
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { wagmiConfig, chains };