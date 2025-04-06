import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useAccount, useChainId } from "wagmi";

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

export function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setIsInitialized(true);
    }
  }, [isConnected]);

  const value = {
    isInitialized,
    isConnected,
    chainId,
    address,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
