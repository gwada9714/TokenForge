import React, { useEffect } from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '../config/wagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  useEffect(() => {
    // Vérifier si MetaMask est installé
    const checkMetaMask = async () => {
      if (typeof window.ethereum === 'undefined') {
        console.warn('MetaMask n\'est pas installé');
      }
    };
    checkMetaMask();
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        theme={darkTheme()}
        modalSize="compact"
        appInfo={{
          appName: 'TokenForge',
          learnMoreUrl: 'https://tokenforge.io/about',
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Providers;
