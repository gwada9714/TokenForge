import { TokenForgeUser } from "../types/auth";
import { AuthError } from "../types/errors";

// Types d'actions unifiés
export const AUTH_ACTIONS = {
  LOGIN_START: "auth/loginStart",
  LOGIN_SUCCESS: "auth/loginSuccess",
  LOGIN_FAILURE: "auth/loginFailure",
  LOGOUT: "auth/logout",
  UPDATE_USER: "auth/updateUser",
  UPDATE_WALLET: "auth/updateWallet",
  SET_ERROR: "auth/setError",
  CLEAR_ERROR: "auth/clearError",
} as const;

// État initial unifié
export interface TokenForgeAuthState {
  user: TokenForgeUser | null;
  wallet: {
    address: `0x${string}` | null;
    isConnected: boolean;
    chainId?: number;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
}

export const initialState: TokenForgeAuthState = {
  user: null,
  wallet: {
    address: null,
    isConnected: false,
    chainId: undefined,
  },
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Types d'actions
export type AuthAction =
  | { type: typeof AUTH_ACTIONS.LOGIN_START }
  | {
      type: typeof AUTH_ACTIONS.LOGIN_SUCCESS;
      payload: { user: TokenForgeUser };
    }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
  | { type: typeof AUTH_ACTIONS.UPDATE_USER; payload: Partial<TokenForgeUser> }
  | {
      type: typeof AUTH_ACTIONS.UPDATE_WALLET;
      payload: Partial<TokenForgeAuthState["wallet"]>;
    }
  | { type: typeof AUTH_ACTIONS.SET_ERROR; payload: AuthError }
  | { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Réducteur unifié
export const authReducer = (
  state: TokenForgeAuthState = initialState,
  action: AuthAction
): TokenForgeAuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        wallet: state.wallet, // Conserver l'état du wallet lors de la déconnexion
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case AUTH_ACTIONS.UPDATE_WALLET:
      return {
        ...state,
        wallet: {
          ...state.wallet,
          ...action.payload,
        },
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
