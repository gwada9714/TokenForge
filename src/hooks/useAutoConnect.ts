import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';

interface AutoConnectOptions {
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAutoConnect = (options: AutoConnectOptions = {}) => {
  const { enabled = true, onSuccess, onError } = options;
  const [isAttempting, setIsAttempting] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    const attemptConnection = async () => {
      if (!enabled || isConnected || isAttempting || !window.ethereum) {
        return;
      }

      setIsAttempting(true);

      try {
        // Vérifier si l'utilisateur a déjà autorisé la connexion
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        }) as string[];

        if (accounts.length > 0) {
          // Si des comptes sont déjà autorisés, on se connecte avec le premier connecteur disponible
          const injectedConnector = connectors.find(c => c.id === 'injected');
          if (injectedConnector) {
            await connect({ connector: injectedConnector });
            onSuccess?.();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la connexion automatique:', error);
        onError?.(error as Error);
      } finally {
        setIsAttempting(false);
      }
    };

    attemptConnection();
  }, [enabled, isConnected, connect, connectors, onSuccess, onError]);

  return {
    isAttempting
  };
}; 