import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createConfig, WagmiConfig } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'wagmi/chains';
import App from './App';
import './index.css';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http()
  }),
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);