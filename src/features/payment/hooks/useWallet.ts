import { useState, useCallback } from "react";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { PaymentNetwork } from "../../multi-chain/services/payment/types/PaymentSession";
import { SUPPORTED_NETWORKS } from "../../multi-chain/services/payment/config/SupportedTokens";
import WalletConnectService from "../../multi-chain/services/wallet/WalletConnectService";

export interface WalletState {
  isConnected: boolean;
  address?: string;
  network?: PaymentNetwork;
  isConnecting: boolean;
  error?: Error;
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();

  const walletService = WalletConnectService.getInstance();

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(undefined);
      await walletService.connect();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to connect wallet")
      );
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await walletService.disconnect();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to disconnect wallet")
      );
    }
  }, []);

  const switchNetwork = useCallback(async (network: PaymentNetwork) => {
    try {
      const networkConfig = SUPPORTED_NETWORKS.find(
        (n) => n.network === network
      );
      if (!networkConfig) {
        throw new Error("Network not supported");
      }
      await walletService.switchNetwork(networkConfig.chainId);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to switch network")
      );
      throw err;
    }
  }, []);

  // Conversion du réseau wagmi en PaymentNetwork
  const getCurrentNetwork = useCallback((): PaymentNetwork | undefined => {
    if (!chainId) return undefined;

    switch (chainId) {
      case 1:
        return PaymentNetwork.ETHEREUM;
      case 137:
        return PaymentNetwork.POLYGON;
      case 56:
        return PaymentNetwork.BINANCE;
      default:
        return undefined;
    }
  }, [chainId]);

  const signPaymentMessage = useCallback(
    async (message: string): Promise<string> => {
      try {
        const signature = await signMessageAsync({ message });
        return signature;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to sign message")
        );
        throw err;
      }
    },
    [signMessageAsync]
  );

  return {
    isConnected,
    address,
    network: getCurrentNetwork(),
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    signPaymentMessage,
  };
}
