interface Workbox {
  addEventListener: (event: string, callback: (event: any) => void) => void;
  register: () => Promise<void>;
  // Add other workbox methods you're using
}

interface Window {
  workbox: Workbox;
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (...args: any[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
    isConnected: () => boolean;
    chainId: string;
    networkVersion: string;
  };
}

export {};
