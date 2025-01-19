import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import App from './App';

// Configuration de Wagmi
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '',
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

class AppInitializationError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'INIT_ERROR',
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppInitializationError';
    Object.setPrototypeOf(this, AppInitializationError.prototype);
  }

  static elementNotFound(): AppInitializationError {
    return new AppInitializationError(
      'Failed to find the root element. Make sure there is a <div id="root"> in your HTML.',
      'ROOT_NOT_FOUND'
    );
  }

  static renderError(cause: unknown): AppInitializationError {
    return new AppInitializationError(
      'Failed to render the application.',
      'RENDER_ERROR',
      cause
    );
  }
}

const initializeApp = (): Root => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw AppInitializationError.elementNotFound();
  }
  return createRoot(rootElement);
};

const renderApp = (root: Root): void => {
  try {
    root.render(
      <StrictMode>
        <WagmiConfig config={config}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WagmiConfig>
      </StrictMode>
    );
  } catch (error) {
    throw AppInitializationError.renderError(error);
  }
};

const handleError = (error: unknown): void => {
  if (error instanceof AppInitializationError) {
    console.error(`Application initialization failed (${error.code}):`, error.message)
    if (error.cause) {
      console.error('Caused by:', error.cause)
    }
  } else {
    console.error('Unexpected error during initialization:', error)
  }

  // Afficher une UI d'erreur à l'utilisateur
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, sans-serif;
        color: #1a202c;
      ">
        <h1 style="margin-bottom: 1rem;">Une erreur est survenue</h1>
        <p style="color: #4a5568;">Veuillez rafraîchir la page ou réessayer plus tard.</p>
      </div>
    `
  }
}

try {
  const root = initializeApp()
  renderApp(root)
} catch (error) {
  handleError(error)
}