import React, { useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      autoRefreshOnNetworkChange?: boolean;
    };
    __VITE_SCRIPT_NONCE__?: string;
  }
}

const useWalletConnectFix = () => {
  useEffect(() => {
    if (window.ethereum?.isMetaMask) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
  }, []);
};

export const ScriptLoader: React.FC = () => {
  useWalletConnectFix();
  
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap"
        nonce={window.__VITE_SCRIPT_NONCE__}
      />
    </>
  );
};
