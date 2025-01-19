import { useReducer, useCallback } from 'react';
import { WalletState, AuthAction, AUTH_ACTIONS, WalletClientType } from '../types';

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  walletClient: null,
};

function walletReducer(state: WalletState, action: AuthAction): WalletState {
  switch (action.type) {
    case AUTH_ACTIONS.WALLET_CONNECT:
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        chainId: action.payload.chainId,
        walletClient: action.payload.walletClient,
        isCorrectNetwork: action.payload.isCorrectNetwork,
      };
    case AUTH_ACTIONS.WALLET_DISCONNECT:
      return {
        ...initialState,
      };
    case AUTH_ACTIONS.NETWORK_CHANGE:
      return {
        ...state,
        chainId: action.payload.chainId,
        isCorrectNetwork: action.payload.isCorrectNetwork,
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
    walletClient: WalletClientType,
    isCorrectNetwork: boolean
  ) => {
    dispatch({
      type: AUTH_ACTIONS.WALLET_CONNECT,
      payload: { address, chainId, walletClient, isCorrectNetwork },
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.WALLET_DISCONNECT });
  }, []);

  const updateNetwork = useCallback((chainId: number, isCorrectNetwork: boolean) => {
    dispatch({
      type: AUTH_ACTIONS.NETWORK_CHANGE,
      payload: { chainId, isCorrectNetwork },
    });
  }, []);

  return {
    state,
    actions: {
      connectWallet,
      disconnectWallet,
      updateNetwork,
    },
  };
}
