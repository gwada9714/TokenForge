import { useState, useEffect } from "react";
import { createBlockchainService } from "../factory";

/**
 * Hook React pour utiliser les services blockchain dans l'UI
 * Permet d'accéder aux fonctionnalités blockchain depuis les composants React
 */
export const useBlockchain = (chainName: string, walletProvider?: any) => {
  const [service, setService] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initService = async () => {
      try {
        const blockchainService = createBlockchainService(
          chainName,
          walletProvider
        );
        setService(blockchainService);

        const connected = await blockchainService.isConnected();
        setIsConnected(connected);

        if (connected) {
          const networkId = await blockchainService.getNetworkId();
          setNetworkId(networkId);
        }
      } catch (error: any) {
        setError(error.message);
      }
    };

    initService();
  }, [chainName, walletProvider]);

  return { service, isConnected, networkId, error };
};
