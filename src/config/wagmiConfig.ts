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

// Configuration des fournisseurs
const { chains, publicClient } = configureChains(
  [sepolia, mainnet],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
    publicProvider(),
  ]
);

// Configuration des portefeuilles disponibles
const connectors = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: [
      metaMaskWallet({ projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID, chains }),
      injectedWallet({ chains }),
      walletConnectWallet({ projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID, chains }),
    ],
  },
]);

// Configuration de wagmi
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains };