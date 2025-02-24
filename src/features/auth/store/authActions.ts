import { TokenForgeUser } from '../types/auth';
import { AuthError } from '../types/errors';
import { AUTH_ACTIONS, AuthAction } from './authReducer';

// Action creators
export const authActions = {
  loginStart: (): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_START
  }),

  loginSuccess: (user: TokenForgeUser): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_SUCCESS,
    payload: { user }
  }),

  loginFailure: (error: AuthError): AuthAction => ({
    type: AUTH_ACTIONS.LOGIN_FAILURE,
    payload: error
  }),

  logout: (): AuthAction => ({
    type: AUTH_ACTIONS.LOGOUT
  }),

  updateUser: (userData: Partial<TokenForgeUser>): AuthAction => ({
    type: AUTH_ACTIONS.UPDATE_USER,
    payload: userData
  }),

  updateWallet: (walletData: {
    address?: `0x${string}` | null;
    isConnected?: boolean;
    chainId?: number;
  }): AuthAction => ({
    type: AUTH_ACTIONS.UPDATE_WALLET,
    payload: walletData
  }),

  setError: (error: AuthError): AuthAction => ({
    type: AUTH_ACTIONS.SET_ERROR,
    payload: error
  }),

  clearError: (): AuthAction => ({
    type: AUTH_ACTIONS.CLEAR_ERROR
  })
};
