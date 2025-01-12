import { sepolia } from 'viem/chains';
import { http, type Chain } from 'viem';
import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Vérification des variables d'environnement requises
if (!import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');
}

if (!import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA) {
  throw new Error('Missing VITE_TOKEN_FACTORY_SEPOLIA address');
}

const tokenFactoryAddress = import.meta.env.VITE_TOKEN_FACTORY_SEPOLIA;
if (!tokenFactoryAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
  throw new Error('Invalid TokenFactory contract address format');
}

// Configuration des chaînes avec les adresses des contrats
export const chains = [{
  ...sepolia,
  contracts: {
    tokenFactory: {
      address: tokenFactoryAddress as `0x${string}`,
      blockCreated: 4728124
    }
  }
}] as const satisfies readonly [Chain, ...Chain[]];

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string;

const { wallets } = getDefaultWallets({
  appName: 'Token Manager',
  projectId,
});

const connectors = connectorsForWallets([...wallets], { 
  projectId,
  appName: 'Token Manager'
});

const transport = http();

export const config = createConfig({
  connectors,
  chains,
  transports: {
    [sepolia.id]: transport
  }
});

// Exports pour les composants de test
export const defaultChain = chains[0];
export const tokenFactoryConfig = {
  address: tokenFactoryAddress as `0x${string}`,
  chain: defaultChain
};

export const wagmiConfig = config;