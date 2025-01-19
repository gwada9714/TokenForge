import React from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '../config/wagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: '#2196f3',
          borderRadius: 'medium',
        })}
        coolMode
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Providers;
