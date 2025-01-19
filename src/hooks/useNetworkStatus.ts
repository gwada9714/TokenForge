import { useEffect, useState, useCallback } from "react";
import { useNetwork } from "./useNetwork";
import { toast } from "react-hot-toast";
import { type Chain } from "viem";

interface NetworkStatus {
  isConnected: boolean;
  isSupported: boolean;
  isSwitching: boolean;
  currentChain?: Chain;
  error: string | null;
  isMainnet: boolean;
  isTestnet: boolean;
  switchToTestnet: () => Promise<void>;
  switchToMainnet: () => Promise<void>;
}

export const useNetworkStatus = () => {
  const { chain, chains } = useNetwork();
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    isSupported: false,
    isSwitching: false,
    error: null,
    isMainnet: false,
    isTestnet: false,
    switchToTestnet: async () => {
      setStatus(prev => ({ ...prev, isSwitching: true }));
      try {
        // Logique de changement vers testnet
        setStatus(prev => ({ ...prev, isSwitching: false }));
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          isSwitching: false,
          error: error instanceof Error ? error.message : "Failed to switch network"
        }));
      }
    },
    switchToMainnet: async () => {
      setStatus(prev => ({ ...prev, isSwitching: true }));
      try {
        // Logique de changement vers mainnet
        setStatus(prev => ({ ...prev, isSwitching: false }));
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          isSwitching: false,
          error: error instanceof Error ? error.message : "Failed to switch network"
        }));
      }
    }
  });

  const updateStatus = useCallback((newStatus: Partial<NetworkStatus>) => {
    setStatus(prev => ({
      ...prev,
      ...newStatus
    }));
  }, []);

  useEffect(() => {
    if (!chain) {
      updateStatus({
        isConnected: false,
        isSupported: false,
        isSwitching: false,
        error: "No network detected",
        isMainnet: false,
        isTestnet: false
      });
      return;
    }

    const isSupported = chains.some(c => c.id === chain.id);
    updateStatus({
      isConnected: true,
      isSupported,
      isSwitching: false,
      currentChain: chain,
      error: isSupported ? null : "Unsupported network",
      isMainnet: chain.id === 1,
      isTestnet: chain.id !== 1
    });

    if (!isSupported) {
      toast.error(`Network not supported: ${chain.name}`);
    }
  }, [chain, chains, updateStatus]);

  return status;
};
