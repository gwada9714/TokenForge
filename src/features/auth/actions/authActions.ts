import { TokenForgeUser, WalletState } from '../types/auth';
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
  LOGIN: 'auth/login',
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
  [AUTH_ACTIONS.LOGIN]: undefined;
  [AUTH_ACTIONS.WALLET_CONNECT]: WalletState;
  [AUTH_ACTIONS.WALLET_DISCONNECT]: undefined;
  [AUTH_ACTIONS.WALLET_NETWORK_CHANGE]: { chainId: number; isCorrectNetwork: boolean };
  [AUTH_ACTIONS.WALLET_UPDATE_PROVIDER]: { provider: any };
};

type AuthActionType = keyof ActionMap;

interface AuthActionWithPayload<T extends AuthActionType> {
  type: T;
  payload: ActionMap[T];
}

interface AuthActionWithoutPayload<T extends AuthActionType> {
  type: T;
}

type AuthAction<T extends AuthActionType> = ActionMap[T] extends undefined 
  ? AuthActionWithoutPayload<T>
  : AuthActionWithPayload<T>;

export const createAuthAction = {
  // Auth actions
  loginStart: () => ({ 
    type: AUTH_ACTIONS.LOGIN_START
  }),
  loginSuccess: (user: TokenForgeUser) => ({ 
    type: AUTH_ACTIONS.LOGIN_SUCCESS, 
    payload: user 
  }),
  loginFailure: (error: AuthError) => ({ 
    type: AUTH_ACTIONS.LOGIN_FAILURE, 
    payload: error 
  }),
  logout: () => ({ 
    type: AUTH_ACTIONS.LOGOUT 
  }),
  updateUser: (updates: Partial<TokenForgeUser>) => ({
    type: AUTH_ACTIONS.UPDATE_USER,
    payload: updates
  }),
  setError: (error: AuthError) => ({ 
    type: AUTH_ACTIONS.SET_ERROR, 
    payload: error 
  }),
  clearError: () => ({ 
    type: AUTH_ACTIONS.CLEAR_ERROR 
  }),

  // Wallet actions
  connectWallet: (walletState: WalletState) => ({
    type: AUTH_ACTIONS.WALLET_CONNECT,
    payload: walletState
  }),
  disconnectWallet: () => ({
    type: AUTH_ACTIONS.WALLET_DISCONNECT
  }),
  updateNetwork: (chainId: number, isCorrectNetwork: boolean) => ({
    type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
    payload: { chainId, isCorrectNetwork }
  }),
  updateProvider: (provider: any) => ({
    type: AUTH_ACTIONS.WALLET_UPDATE_PROVIDER,
    payload: { provider }
  })
};

export interface TokenForgeAuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
  clearError: () => Promise<void>;
  connectWallet: (walletState: WalletState) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateNetwork: (chainId: number, isCorrectNetwork: boolean) => Promise<void>;
  updateProvider: (provider: any) => Promise<void>;
}

export const authActions: TokenForgeAuthActions = {
  // Auth actions
  login: async (_email: string, _password: string): Promise<void> => {
    // Implémentation à venir
  },
  logout: async (): Promise<void> => {
    // Implémentation à venir
  },
  updateUser: async (updates: Partial<TokenForgeUser>): Promise<void> => {
    // Implémentation à venir
  },
  clearError: async (): Promise<void> => {
    // Implémentation à venir
  },
  // Wallet actions
  connectWallet: async (walletState: WalletState): Promise<void> => {
    // Implémentation à venir
  },
  disconnectWallet: async (): Promise<void> => {
    // Implémentation à venir
  },
  updateNetwork: async (chainId: number, isCorrectNetwork: boolean): Promise<void> => {
    // Implémentation à venir
  },
  updateProvider: async (provider: any): Promise<void> => {
    // Implémentation à venir
  }
};
