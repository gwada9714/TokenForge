import { useState, useEffect } from "react";
import {
  createWalletClient,
  custom,
  WalletClient,
  createPublicClient,
  http,
} from "viem";
import { mainnet } from "viem/chains";

export const useWeb3Provider = () => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) {
      console.log("Web3Provider: No ethereum provider found");
      return;
    }

    try {
      console.log("Web3Provider: Initializing clients");

      // Créer un wallet client pour interagir avec le wallet
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });
      console.log("Web3Provider: Wallet client created");
      setWalletClient(client);

      // Créer un public client pour les lectures de chaîne
      const public_client = createPublicClient({
        chain: mainnet,
        transport: http(),
      });
      console.log("Web3Provider: Public client created");
      setPublicClient(public_client);
    } catch (err) {
      console.error("Web3Provider: Error initializing clients", err);
      setError(
        err instanceof Error ? err : new Error("Failed to initialize Web3")
      );
    }
  }, []);

  return { walletClient, publicClient, error };
};
