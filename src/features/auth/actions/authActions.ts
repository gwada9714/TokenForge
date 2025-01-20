import { TokenForgeUser, WalletState } from '../types';
import { AuthError } from '../errors/AuthError';

export const AUTH_ACTIONS = {
  // Auth actions
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  UPDATE_USER: 'auth/updateUser',
  SET_ERROR: 'auth/setError',
  CLEAR_ERROR: 'auth/clearError',
  
  // Wallet actions
  WALLET_CONNECT: 'auth/walletConnect',
  WALLET_DISCONNECT: 'auth/walletDisconnect',
  WALLET_NETWORK_CHANGE: 'auth/walletNetworkChange',
  WALLET_UPDATE_PROVIDER: 'auth/walletUpdateProvider'
} as const;

type ActionMap = {
  [AUTH_ACTIONS.LOGIN_START]: undefined;
  [AUTH_ACTIONS.LOGIN_SUCCESS]: TokenForgeUser;
  [AUTH_ACTIONS.LOGIN_FAILURE]: AuthError;
  [AUTH_ACTIONS.LOGOUT]: undefined;
  [AUTH_ACTIONS.UPDATE_USER]: Partial<TokenForgeUser>;
  [AUTH_ACTIONS.SET_ERROR]: AuthError;
  [AUTH_ACTIONS.CLEAR_ERROR]: undefined;
  [AUTH_ACTIONS.WALLET_CONNECT]: WalletState;
  [AUTH_ACTIONS.WALLET_DISCONNECT]: undefined;
  [AUTH_ACTIONS.WALLET_NETWORK_CHANGE]: { chainId: number; isCorrectNetwork: boolean };
  [AUTH_ACTIONS.WALLET_UPDATE_PROVIDER]: { provider: any };
};

export type AuthAction = {
  [K in keyof ActionMap]: ActionMap[K] extends undefined
    ? { type: K }
    : { type: K; payload: ActionMap[K] };
}[keyof ActionMap];

export const authActions = {
  loginStart: () => ({ type: AUTH_ACTIONS.LOGIN_START }),
  loginSuccess: (user: TokenForgeUser) => ({ 
    type: AUTH_ACTIONS.LOGIN_SUCCESS, 
    payload: user 
  }),
  loginFailure: (error: AuthError) => ({ 
    type: AUTH_ACTIONS.LOGIN_FAILURE, 
    payload: error 
  }),
  logout: () => ({ type: AUTH_ACTIONS.LOGOUT }),
  updateUser: (updates: Partial<TokenForgeUser>) => ({ 
    type: AUTH_ACTIONS.UPDATE_USER, 
    payload: updates 
  }),
  setError: (error: AuthError) => ({ 
    type: AUTH_ACTIONS.SET_ERROR, 
    payload: error 
  }),
  clearError: () => ({ type: AUTH_ACTIONS.CLEAR_ERROR }),
  
  // Wallet actions
  connectWallet: (walletState: WalletState) => ({ 
    type: AUTH_ACTIONS.WALLET_CONNECT, 
    payload: walletState 
  }),
  disconnectWallet: () => ({ type: AUTH_ACTIONS.WALLET_DISCONNECT }),
  updateNetwork: (chainId: number, isCorrectNetwork: boolean) => ({
    type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
    payload: { chainId, isCorrectNetwork }
  }),
  updateProvider: (provider: any) => ({ 
    type: AUTH_ACTIONS.WALLET_UPDATE_PROVIDER, 
    payload: { provider } 
  })
};
