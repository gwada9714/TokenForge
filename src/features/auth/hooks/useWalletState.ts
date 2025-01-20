import { useReducer, useCallback, useEffect } from 'react';
import { WalletState, WalletClientType } from '../types';
import { mainnet, sepolia } from '../../../config/chains';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { walletReconnectionService } from '../services/walletReconnectionService';

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  walletClient: null,
  provider: null,
};

type WalletAction =
  | { type: 'CONNECT'; payload: { address: string; chainId: number; walletClient: WalletClientType; provider: any } }
  | { type: 'DISCONNECT' }
  | { type: 'UPDATE_NETWORK'; payload: { chainId: number } }
  | { type: 'UPDATE_PROVIDER'; payload: { provider: any } }
  | { type: 'UPDATE_STATE'; payload: Partial<WalletState> };

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case mainnet.id:
      return 'Ethereum Mainnet';
    case sepolia.id:
      return 'Sepolia Testnet';
    default:
      return `Réseau ${chainId}`;
  }
}

function isCorrectChainId(chainId: number): boolean {
  return chainId === mainnet.id || chainId === sepolia.id;
}

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        chainId: action.payload.chainId,
        walletClient: action.payload.walletClient,
        provider: action.payload.provider,
        isCorrectNetwork: isCorrectChainId(action.payload.chainId),
      };
    case 'DISCONNECT':
      return initialState;
    case 'UPDATE_NETWORK':
      return {
        ...state,
        chainId: action.payload.chainId,
        isCorrectNetwork: isCorrectChainId(action.payload.chainId),
      };
    case 'UPDATE_PROVIDER':
      return {
        ...state,
        provider: action.payload.provider,
      };
    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

export function useWalletState() {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connectWallet = useCallback((
    address: string,
    chainId: number,
    walletClient: WalletClientType | null,
    provider: any
  ) => {
    if (!walletClient) return;
    
    dispatch({
      type: 'CONNECT',
      payload: { 
        address, 
        chainId, 
        walletClient,
        provider,
      },
    });

    notificationService.notifyWalletConnected(address);

    if (!isCorrectChainId(chainId)) {
      const currentNetwork = getNetworkName(chainId);
      const expectedNetworks = [
        getNetworkName(mainnet.id),
        getNetworkName(sepolia.id),
      ].join(' ou ');
      
      notificationService.notifyWrongNetwork(expectedNetworks, currentNetwork);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    dispatch({ type: 'DISCONNECT' });
    notificationService.notifyWalletDisconnected();
    walletReconnectionService.clearState();
  }, []);

  // Tentative de reconnexion au démarrage
  useEffect(() => {
    const initializeWallet = async () => {
      await walletReconnectionService.attemptReconnection(
        connectWallet,
        disconnectWallet
      );
    };

    initializeWallet();

    return () => {
      walletReconnectionService.clearState();
    };
  }, [connectWallet, disconnectWallet]);

  // Sauvegarder l'état dans le stockage local quand il change
  useEffect(() => {
    if (state.isConnected) {
      storageService.saveWalletState({
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected,
        isCorrectNetwork: state.isCorrectNetwork,
      });
    } else {
      storageService.clearWalletState();
    }
  }, [state.isConnected, state.address, state.chainId, state.isCorrectNetwork]);

  const updateNetwork = useCallback((chainId: number) => {
    dispatch({
      type: 'UPDATE_NETWORK',
      payload: { chainId },
    });
    
    const networkName = getNetworkName(chainId);
    notificationService.notifyNetworkChanged(networkName);

    if (!isCorrectChainId(chainId)) {
      const expectedNetworks = [
        getNetworkName(mainnet.id),
        getNetworkName(sepolia.id),
      ].join(' ou ');
      
      notificationService.notifyWrongNetwork(expectedNetworks, networkName);
    }
  }, []);

  const updateProvider = useCallback((provider: any) => {
    dispatch({
      type: 'UPDATE_PROVIDER',
      payload: { provider },
    });
  }, []);

  const updateWalletState = useCallback((newState: Partial<WalletState>) => {
    dispatch({ type: 'UPDATE_STATE', payload: newState });
  }, []);

  return {
    state,
    actions: {
      connectWallet,
      disconnectWallet,
      updateNetwork,
      updateProvider,
      updateWalletState,
    },
  };
}
