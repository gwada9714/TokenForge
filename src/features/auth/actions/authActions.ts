import { TokenForgeUser, WalletState } from '../types/auth';
import { AuthError } from '../errors/AuthError';

export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  WALLET_CONNECT: 'WALLET_CONNECT',
  WALLET_DISCONNECT: 'WALLET_DISCONNECT',
  WALLET_NETWORK_CHANGE: 'WALLET_NETWORK_CHANGE',
  WALLET_UPDATE_PROVIDER: 'WALLET_UPDATE_PROVIDER'
} as const;

export const createAuthAction = {
  loginStart() {
    return { type: AUTH_ACTIONS.LOGIN_START };
  },
  loginSuccess(user: TokenForgeUser, token: string) {
    return { type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } };
  },
  loginFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error };
  },
  logout() {
    return { type: AUTH_ACTIONS.LOGOUT };
  },
  updateUser(updates: Partial<TokenForgeUser>) {
    return { type: AUTH_ACTIONS.UPDATE_USER, payload: updates };
  },
  setError(error: AuthError) {
    return { type: AUTH_ACTIONS.SET_ERROR, payload: error };
  },
  clearError() {
    return { type: AUTH_ACTIONS.CLEAR_ERROR };
  },
  connectWallet(walletState: WalletState) {
    return { type: AUTH_ACTIONS.WALLET_CONNECT, payload: walletState };
  },
  disconnectWallet() {
    return { type: AUTH_ACTIONS.WALLET_DISCONNECT };
  },
  updateNetwork(chainId: number, isCorrectNetwork: boolean) {
    return { type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE, payload: { chainId, isCorrectNetwork } };
  },
  updateProvider(provider: any) {
    return { type: AUTH_ACTIONS.WALLET_UPDATE_PROVIDER, payload: provider };
  }
};
