/// <reference types="@testing-library/jest-dom/vitest" />

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
      autoRefreshOnNetworkChange?: boolean;
      chainId?: string;
      networkVersion?: string;
      selectedAddress?: string | null;
    };
    Buffer: typeof Buffer;
  }
}

import { Buffer } from 'buffer';

export {} 