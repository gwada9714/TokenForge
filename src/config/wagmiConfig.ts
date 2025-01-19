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

// Récupération des variables d'environnement
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!alchemyKey) throw new Error('VITE_ALCHEMY_API_KEY is not defined');
if (!projectId) throw new Error('VITE_WALLET_CONNECT_PROJECT_ID is not defined');

// Configuration des fournisseurs avec retries optimisés
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, mainnet],
  [
    alchemyProvider({ 
      apiKey: alchemyKey,
    }),
    publicProvider(),
  ],
  {
    batch: { multicall: true },
    retryCount: 3,
    pollingInterval: 4_000,
  }
);

// Configuration des portefeuilles disponibles
const connectors = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: [
      injectedWallet({ 
        chains,
      }),
      metaMaskWallet({ 
        projectId, 
        chains,
      }),
      walletConnectWallet({ 
        projectId, 
        chains,
      }),
    ],
  },
]);

// Configuration de wagmi avec gestion d'erreur améliorée
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
  logger: {
    warn: (message) => console.warn(message)
  }
});

export { chains };