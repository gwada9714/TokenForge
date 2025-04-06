import React, { createContext, useContext, useEffect, useState } from "react";
import { WalletService } from "../services/WalletService";
import { WalletState, WalletConfig } from "../types";
import { logger } from "@/core/logger/Logger";

const WalletContext = createContext<WalletState | null>(null);

export const WalletProvider: React.FC<{
  children: React.ReactNode;
  config: WalletConfig;
}> = ({ children, config }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    connected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const walletService = WalletService.getInstance(config);

    const initialize = async () => {
      try {
        await walletService.initialize();
        setWalletState(walletService.getState());
      } catch (error) {
        logger.error(
          "WalletProvider",
          "Failed to initialize wallet",
          error as Error
        );
        setWalletState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
      }
    };

    initialize();
  }, [config]);

  return (
    <WalletContext.Provider value={walletState}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
