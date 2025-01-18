/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useContext, ReactNode } from "react";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig, chains } from "../config/wagmiConfig";
import '@rainbow-me/rainbowkit/styles.css';

interface Web3ProviderProps {
  children: ReactNode;
}

interface Web3ContextType {
  isInitialized: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <Web3Context.Provider value={{ isInitialized: true }}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
