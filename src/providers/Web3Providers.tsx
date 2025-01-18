import React from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '../config/wagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
