import { configureChains, createConfig } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';

import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_ICONS,
  SUPPORTED_CHAINS,
  WEB3_MODAL_CONFIG,
} from './index';

if (!process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing REACT_APP_WALLET_CONNECT_PROJECT_ID');
}

if (!process.env.REACT_APP_ALCHEMY_API_KEY) {
  throw new Error('Missing REACT_APP_ALCHEMY_API_KEY');
}

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
const alchemyKey = process.env.REACT_APP_ALCHEMY_API_KEY;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  Object.values(SUPPORTED_CHAINS),
  [
    alchemyProvider({ apiKey: alchemyKey }),
    publicProvider(),
  ],
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        showQrModal: true,
        metadata: {
          name: APP_NAME,
          description: APP_DESCRIPTION,
          icons: APP_ICONS,
        },
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: APP_NAME,
        headlessMode: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };
