import React from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { chains, publicClient } = configureChains(
    [mainnet, sepolia],
    [publicProvider()]
  );

  const { connectors } = getDefaultWallets({
    appName: 'TokenForge',
    projectId: 'tokenforge',
    chains
  });

  const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        chains={chains}
        theme={darkTheme()}
        appInfo={{
          appName: 'TokenForge',
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
