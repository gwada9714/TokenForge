import React from 'react';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider, infuraProvider, alchemyProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient } = configureChains(
  [mainnet],
  [
    publicProvider(),
    infuraProvider({ apiKey: import.meta.env.VITE_INFURA_ID }),
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_ID })
  ]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  chains
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider 
        theme={darkTheme()}
        chains={chains}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;