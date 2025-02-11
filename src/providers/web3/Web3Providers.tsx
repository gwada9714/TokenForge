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

export function Web3Providers({ children }: Web3ProvidersProps) {
  useEffect(() => {
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

    // Gestion des changements de réseau
    const handleNetworkChange = (chainId: string) => {
      console.log(`Réseau changé: ${chainId}`);
    };

    // Gestion des changements de compte
    const handleAccountsChange = (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('Déconnecté du wallet');
      } else {
        console.log(`Compte connecté: ${accounts[0]}`);
      }
    };

    checkWalletSecurity();

    // Setup des listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('networkChanged', handleNetworkChange);
      window.ethereum.on('accountsChanged', handleAccountsChange);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('networkChanged', handleNetworkChange);
        window.ethereum.removeListener('accountsChanged', handleAccountsChange);
      }
    };
  }, []);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'medium'
        })}
        modalSize="compact"
        initialChain={mainnet.id}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}