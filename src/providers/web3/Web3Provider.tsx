import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const connectors = connectorsForWallets([
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains: [mainnet, sepolia] }),
        metaMaskWallet({ chains: [mainnet, sepolia] }),
        coinbaseWallet({ chains: [mainnet, sepolia], appName: 'TokenForge' }),
      ],
    },
  ]);

  const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors,
  });

  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
};

export default Web3Provider;
