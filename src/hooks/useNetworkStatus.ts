import { useEffect, useState } from "react";
import { useNetwork } from "./useNetwork";
import { toast } from "react-hot-toast";
import { type Chain } from "viem";

interface NetworkStatus {
  isConnected: boolean;
  isSupported: boolean;
  isSwitching: boolean;
  currentChain?: Chain;
  error: string | null;
}

export const useNetworkStatus = () => {
  const { chain, chains } = useNetwork();
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    isSupported: false,
    isSwitching: false,
    error: null
  });

  useEffect(() => {
    if (!chain) {
      setStatus({
        isConnected: false,
        isSupported: false,
        isSwitching: false,
        error: "No network detected"
      });
      return;
    }

    const isSupported = chains.some(c => c.id === chain.id);
    
    setStatus({
      isConnected: true,
      isSupported,
      isSwitching: false,
      currentChain: chain,
      error: isSupported ? null : "Unsupported network"
    });

    if (!isSupported) {
      toast.error(`Network ${chain.name} is not supported. Please switch to a supported network.`);
    }
  }, [chain, chains]);

  return status;
};
