import { useEffect, useState } from 'react';
import { WalletState } from '../../../types/wallet';
import { serviceRegistry } from '../../../services/ServiceRegistry';
import { ErrorService, NotificationService, WalletReconnectionService } from '../../../types/services';

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  walletClient: null
};

export const useWalletState = () => {
  const [state, setState] = useState<WalletState>(initialState);

  useEffect(() => {
    const walletReconnectionService = serviceRegistry.get<WalletReconnectionService>('walletReconnection');
    const notificationService = serviceRegistry.get<NotificationService>('notification');
    const errorService = serviceRegistry.get<ErrorService>('error');

    const callbacks = {
      onConnect: (address: string, chainId: number) => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          address,
          chainId,
        }));
      },
      onDisconnect: () => {
        setState(initialState);
      },
      onNetworkChange: (chainId: number) => {
        setState(prev => ({
          ...prev,
          chainId,
        }));
      },
      onWalletStateSync: (newState: Partial<WalletState>) => {
        setState(prev => ({
          ...prev,
          ...newState
        }));
      },
      onError: (error: unknown) => {
        errorService.handle(error);
        notificationService.error('Erreur de connexion au wallet');
      }
    };

    walletReconnectionService.setCallbacks(callbacks);

    // Récupérer l'état initial du wallet
    const currentState = walletReconnectionService.getWalletState();
    if (currentState) {
      setState(currentState);
    }

    return () => {
      walletReconnectionService.cleanup();
    };
  }, []);

  return state;
};
