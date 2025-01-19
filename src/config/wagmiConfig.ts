import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
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

// Configuration des chaînes supportées
export const chains = [sepolia, mainnet];

// Configuration des portefeuilles
const connectors = connectorsForWallets([
  {
    groupName: 'Recommandé',
    wallets: [
      metaMaskWallet({ 
        projectId
      }),
      injectedWallet({
        shimDisconnect: true
      }),
      walletConnectWallet({ 
        projectId
      }),
    ],
  },
]);

// Configuration wagmi
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`),
    [sepolia.id]: http(`https://eth-sepolia.alchemyapi.io/v2/${alchemyKey}`),
  },
});