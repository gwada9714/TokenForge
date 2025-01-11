import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const infuraId = process.env.REACT_APP_INFURA_PROJECT_ID;
const alchemyKey = process.env.REACT_APP_ALCHEMY_API_KEY;
const walletConnectProjectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';

const configuredProviders = [
  infuraId ? infuraProvider({ apiKey: infuraId }) : null,
  alchemyKey ? alchemyProvider({ apiKey: alchemyKey }) : null,
  publicProvider(),
].filter(Boolean);

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  configuredProviders as any
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
        showQrModal: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'TokenForge',
      },
    }),
  ],
});

interface Web3ContextType {
  publicClient: typeof publicClient;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <Web3Context.Provider value={{ publicClient }}>
        {children}
      </Web3Context.Provider>
    </WagmiConfig>
  );
};
