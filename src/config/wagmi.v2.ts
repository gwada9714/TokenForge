import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID || '';
const alchemyKey = process.env.VITE_ALCHEMY_API_KEY || '';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'TokenForge' }),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`),
    [sepolia.id]: http(`https://eth-sepolia.alchemyapi.io/v2/${alchemyKey}`),
  },
});
