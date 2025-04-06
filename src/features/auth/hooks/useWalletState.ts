import { useState, useEffect } from "react";
import {
  useAccount,
  useDisconnect,
  useChainId,
  useConnect,
  type Connector,
} from "wagmi";
import { ErrorService } from "../services/errorService";
import { AuthErrorCode } from "../errors/AuthError";

interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  chainId?: number;
  loading: boolean;
  error: Error | null;
}

export function useWalletState() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();

  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    setWallet((prevState) => ({
      ...prevState,
      address: address || null,
      isConnected,
      chainId,
    }));
  }, [address, isConnected, chainId]);

  const handleConnect = async (address: string, chainId: number) => {
    try {
      setWallet((prevState) => ({
        ...prevState,
        loading: true,
      }));

      console.log("Connect wallet called with:", { address, chainId });

      // Use the connect function from wagmi
      // This will trigger the wallet connection dialog
      const injectedConnector = connectors.find(
        (c: Connector) => c.id === "injected"
      );
      if (injectedConnector) {
        await connect({
          connector: injectedConnector,
          chainId,
        });
      } else {
        throw new Error("Injected connector not found");
      }

      setWallet((prevState) => ({
        ...prevState,
        loading: false,
      }));
    } catch (error) {
      const authError = ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Failed to connect wallet",
        error instanceof Error ? error : new Error(String(error))
      );
      setWallet((prevState) => ({
        ...prevState,
        error: authError,
        loading: false,
      }));
    }
  };

  const handleDisconnect = async () => {
    try {
      setWallet((prevState) => ({
        ...prevState,
        loading: true,
      }));

      await disconnect();

      setWallet((prevState) => ({
        ...prevState,
        loading: false,
      }));
    } catch (error) {
      const authError = ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Failed to disconnect wallet",
        error instanceof Error ? error : new Error(String(error))
      );
      setWallet((prevState) => ({
        ...prevState,
        error: authError,
        loading: false,
      }));
    }
  };

  return {
    address,
    isConnected,
    chainId,
    loading: wallet.loading,
    error: wallet.error,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };
}
