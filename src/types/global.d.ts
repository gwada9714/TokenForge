/// <reference types="@testing-library/jest-dom/vitest" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      autoRefreshOnNetworkChange?: boolean;
      chainId?: string;
      networkVersion?: string;
      selectedAddress?: string | null;
    };
    chrome?: {
      runtime?: {
        connect: (...args: any[]) => any;
      };
    };
    Buffer: typeof Buffer;
  }

  interface ImportMetaEnv {
    readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
    readonly VITE_CSP_NONCE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

import { Buffer } from 'buffer';

export {} 