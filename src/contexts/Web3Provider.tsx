/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { WagmiConfig, useAccount, useNetwork } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig, chains } from "../config/wagmiConfig";
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProps {
  children: ReactNode;
}

interface Web3ContextType {
  isInitialized: boolean;
  isConnected: boolean;
  chainId?: number;
  address?: string;
}

const Web3Context = createContext<Web3ContextType | null>(null);

function Web3StateProvider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return (
    <Web3Context.Provider value={{
      isInitialized,
      isConnected,
      chainId: chain?.id,
      address
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Web3StateProvider>
          {children}
        </Web3StateProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === null) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
