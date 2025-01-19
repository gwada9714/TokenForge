import React, { useEffect } from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '../config/wagmiConfig';

// Import dynamique des styles pour éviter les problèmes de SSR
const importRainbowStyles = async () => {
  if (typeof window !== 'undefined') {
    await import('@rainbow-me/rainbowkit/styles.css');
  }
};

interface Web3ProvidersProps {
  children: React.ReactNode;
}

export const Web3Providers: React.FC<Web3ProvidersProps> = ({ children }) => {
  useEffect(() => {
    importRainbowStyles();
    
    // Vérifier si MetaMask est installé
    const checkMetaMask = async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
        console.warn('MetaMask n\'est pas installé');
      }
    };
    checkMetaMask();
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        coolMode
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Providers;
