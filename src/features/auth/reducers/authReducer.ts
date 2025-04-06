import { TokenForgeAuthState } from "../types/auth";
import { AUTH_ACTIONS } from "../actions/authActions";
import { AuthAction } from "../../../types/authTypes";

export const initialState: TokenForgeAuthState = {
  status: "idle",
  isAuthenticated: false,
  user: null,
  error: null,
  wallet: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    walletClient: null,
  },
  loading: false, // Initialisation de loading
  isAdmin: false, // Ajout de isAdmin
  canCreateToken: false, // Ajout de canCreateToken
  canUseServices: false, // Ajout de canUseServices
  hasWalletProvider: false, // Ajout de hasWalletProvider
  walletError: null, // Ajout de walletError
};

export const authReducer = (
  state: TokenForgeAuthState = initialState,
  action: AuthAction
): TokenForgeAuthState => {
  switch (action.type) {
    // Login & Sign In
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGN_IN_START:
    case AUTH_ACTIONS.SIGN_UP_START:
    case AUTH_ACTIONS.RESET_PASSWORD_START:
    case AUTH_ACTIONS.UPDATE_PROFILE_START:
    case AUTH_ACTIONS.LOGOUT_START:
    case AUTH_ACTIONS.CONNECT_WALLET_START:
    case AUTH_ACTIONS.DISCONNECT_WALLET_START:
      return {
        ...state,
        loading: true,
        error: null,
        status: "loading",
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        status: "authenticated",
        isAuthenticated: true,
        user: action.payload.user,
        isAdmin: action.payload.user.isAdmin,
        canCreateToken: action.payload.user.canCreateToken,
        canUseServices: action.payload.user.canUseServices,
      };

    case AUTH_ACTIONS.SIGN_IN_SUCCESS:
    case AUTH_ACTIONS.SIGN_UP_SUCCESS:
      if (action.payload) {
        return {
          ...state,
          loading: false,
          status: "authenticated",
          isAuthenticated: true,
          user: action.payload,
          isAdmin: action.payload.isAdmin,
          canCreateToken: action.payload.canCreateToken,
          canUseServices: action.payload.canUseServices,
        };
      }
      return {
        ...state,
        loading: false,
        status: "idle",
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGN_IN_FAILURE:
    case AUTH_ACTIONS.SIGN_UP_FAILURE:
    case AUTH_ACTIONS.LOGOUT_FAILURE:
    case AUTH_ACTIONS.RESET_PASSWORD_FAILURE:
    case AUTH_ACTIONS.UPDATE_PROFILE_FAILURE:
    case AUTH_ACTIONS.CONNECT_WALLET_FAILURE:
    case AUTH_ACTIONS.DISCONNECT_WALLET_FAILURE:
      return {
        ...state,
        loading: false,
        status: "error",
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...initialState,
      };

    case AUTH_ACTIONS.UPDATE_USER:
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      if (!state.user) return state;
      return {
        ...state,
        loading: false,
        user: { ...state.user, ...action.payload },
        isAdmin:
          action.payload.isAdmin !== undefined
            ? action.payload.isAdmin
            : state.isAdmin,
        canCreateToken:
          action.payload.canCreateToken !== undefined
            ? action.payload.canCreateToken
            : state.canCreateToken,
        canUseServices:
          action.payload.canUseServices !== undefined
            ? action.payload.canUseServices
            : state.canUseServices,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        status: "error",
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        status: state.isAuthenticated ? "authenticated" : "idle",
      };

    case AUTH_ACTIONS.CONNECT_WALLET_SUCCESS:
      return {
        ...state,
        loading: false,
        wallet: action.payload,
        status: state.isAuthenticated ? "authenticated" : "wallet_connected",
      };

    // Support pour les anciens types WALLET_CONNECT/WALLET_DISCONNECT
    case AUTH_ACTIONS.WALLET_CONNECT:
      return {
        ...state,
        loading: false,
        wallet: {
          ...state.wallet,
          isConnected: true,
          address: action.payload.address as `0x${string}` | null,
          chainId: action.payload.chainId,
          isCorrectNetwork: true,
          walletClient: state.wallet.walletClient,
        },
        status: state.isAuthenticated ? "authenticated" : "wallet_connected",
      };

    case AUTH_ACTIONS.WALLET_DISCONNECT:
    case AUTH_ACTIONS.DISCONNECT_WALLET_SUCCESS:
      return {
        ...state,
        loading: false,
        wallet: {
          isConnected: false,
          address: null,
          chainId: null,
          isCorrectNetwork: false,
          walletClient: null,
        },
        status: state.isAuthenticated ? "authenticated" : "idle",
      };

    case AUTH_ACTIONS.WALLET_NETWORK_CHANGE:
      return {
        ...state,
        wallet: {
          ...state.wallet,
          chainId: action.payload.chainId,
          isCorrectNetwork: action.payload.isCorrectNetwork,
        },
      };

    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        status: "idle",
      };

    // Nouvelles actions pour la gestion du provider wallet
    case AUTH_ACTIONS.SET_WALLET_PROVIDER_STATUS:
      return {
        ...state,
        hasWalletProvider: action.payload.hasWalletProvider,
      };

    case AUTH_ACTIONS.SET_WALLET_ERROR:
      return {
        ...state,
        walletError: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_WALLET_ERROR:
      return {
        ...state,
        walletError: null,
      };

    default:
      return state;
  }
};
