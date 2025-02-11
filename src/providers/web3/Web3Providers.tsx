import { ReactNode, useEffect } from 'react';
import { WagmiConfig } from 'wagmi';
import { mainnet, polygon } from 'viem/chains';
import { 
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { isAllowedWalletExtension } from '../../utils/security';
import { http } from 'viem';

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!WALLET_CONNECT_PROJECT_ID) {
  throw new Error('VITE_WALLET_CONNECT_PROJECT_ID is required');
}

interface Web3ProvidersProps {
  children: ReactNode;
}

// Configuration avec RainbowKit
const config = getDefaultConfig({
  appName: 'TokenForge',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon],
  ssr: false,
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`),
    [polygon.id]: http(`https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`)
  }
});

const initializeProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = window.ethereum;
    
    provider.on('disconnect', (error: Error) => {
      console.error('MetaMask disconnect:', error);
      // Attendre un peu avant de recharger pour laisser le temps aux états de se mettre à jour
      setTimeout(() => window.location.reload(), 3000);
    });

    provider.on('chainChanged', () => {
      window.location.reload();
    });

    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      }
    });

    return provider;
  }
  return null;
};

export function Web3Providers({ children }: Web3ProvidersProps) {
  useEffect(() => {
    // Initialisation du provider
    const provider = initializeProvider();
    
    // Vérification de la sécurité des extensions
    const checkWalletSecurity = () => {
      if (typeof window !== 'undefined' && 'chrome' in window) {
        const installedExtensions = Object.keys((window as any).chrome?.runtime?.connect || {});
        installedExtensions.forEach(extensionId => {
          if (!isAllowedWalletExtension(extensionId)) {
            console.warn(`Extension wallet non autorisée détectée: ${extensionId}`);
          }
        });
      }
    };

    checkWalletSecurity();

    // Cleanup
    return () => {
      if (provider) {
        provider.removeListener('disconnect', () => {});
        provider.removeListener('chainChanged', () => {});
        provider.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider theme={darkTheme()}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}