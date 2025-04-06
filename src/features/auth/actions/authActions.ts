import { TokenForgeUser } from "../types/auth";
import { WalletConnectionState } from "../../../types/authTypes";
import { AuthError } from "../errors/AuthError";

export const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT_START: "LOGOUT_START",
  LOGOUT_SUCCESS: "LOGOUT_SUCCESS",
  LOGOUT_FAILURE: "LOGOUT_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  WALLET_CONNECT: "WALLET_CONNECT",
  WALLET_DISCONNECT: "WALLET_DISCONNECT",
  WALLET_NETWORK_CHANGE: "WALLET_NETWORK_CHANGE",
  WALLET_UPDATE_PROVIDER: "WALLET_UPDATE_PROVIDER",
  RESET_PASSWORD_START: "RESET_PASSWORD_START",
  RESET_PASSWORD_SUCCESS: "RESET_PASSWORD_SUCCESS",
  RESET_PASSWORD_FAILURE: "RESET_PASSWORD_FAILURE",
  UPDATE_PROFILE_START: "UPDATE_PROFILE_START",
  UPDATE_PROFILE_SUCCESS: "UPDATE_PROFILE_SUCCESS",
  UPDATE_PROFILE_FAILURE: "UPDATE_PROFILE_FAILURE",
  CONNECT_WALLET_START: "CONNECT_WALLET_START",
  CONNECT_WALLET_SUCCESS: "CONNECT_WALLET_SUCCESS",
  CONNECT_WALLET_FAILURE: "CONNECT_WALLET_FAILURE",
  DISCONNECT_WALLET_START: "DISCONNECT_WALLET_START",
  DISCONNECT_WALLET_SUCCESS: "DISCONNECT_WALLET_SUCCESS",
  DISCONNECT_WALLET_FAILURE: "DISCONNECT_WALLET_FAILURE",
  SIGN_IN_START: "SIGN_IN_START",
  SIGN_IN_SUCCESS: "SIGN_IN_SUCCESS",
  SIGN_IN_FAILURE: "SIGN_IN_FAILURE",
  SIGN_UP_START: "SIGN_UP_START",
  SIGN_UP_SUCCESS: "SIGN_UP_SUCCESS",
  SIGN_UP_FAILURE: "SIGN_UP_FAILURE",
  SET_WALLET_PROVIDER_STATUS: "SET_WALLET_PROVIDER_STATUS",
  SET_WALLET_ERROR: "SET_WALLET_ERROR",
  CLEAR_WALLET_ERROR: "CLEAR_WALLET_ERROR",
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
  logoutStart() {
    return { type: AUTH_ACTIONS.LOGOUT_START };
  },
  logoutSuccess() {
    return { type: AUTH_ACTIONS.LOGOUT_SUCCESS };
  },
  logoutFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.LOGOUT_FAILURE, payload: error };
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
  connectWallet(wallet: WalletConnectionState) {
    return { type: AUTH_ACTIONS.WALLET_CONNECT, payload: wallet };
  },
  disconnectWallet() {
    return { type: AUTH_ACTIONS.WALLET_DISCONNECT };
  },
  updateNetwork(chainId: number, isCorrectNetwork: boolean) {
    return {
      type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
      payload: { chainId, isCorrectNetwork },
    };
  },
  updateProvider(provider: any) {
    return { type: AUTH_ACTIONS.WALLET_UPDATE_PROVIDER, payload: provider };
  },
  resetPasswordStart() {
    return { type: AUTH_ACTIONS.RESET_PASSWORD_START };
  },
  resetPasswordSuccess() {
    return { type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS };
  },
  resetPasswordFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.RESET_PASSWORD_FAILURE, payload: error };
  },
  updateProfileStart() {
    return { type: AUTH_ACTIONS.UPDATE_PROFILE_START };
  },
  updateProfileSuccess(user: Partial<TokenForgeUser>) {
    return { type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS, payload: user };
  },
  updateProfileFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE, payload: error };
  },
  connectWalletStart() {
    return { type: AUTH_ACTIONS.CONNECT_WALLET_START };
  },
  connectWalletSuccess(walletState: WalletConnectionState) {
    return { type: AUTH_ACTIONS.CONNECT_WALLET_SUCCESS, payload: walletState };
  },
  connectWalletFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.CONNECT_WALLET_FAILURE, payload: error };
  },
  disconnectWalletStart() {
    return { type: AUTH_ACTIONS.DISCONNECT_WALLET_START };
  },
  disconnectWalletSuccess() {
    return { type: AUTH_ACTIONS.DISCONNECT_WALLET_SUCCESS };
  },
  disconnectWalletFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.DISCONNECT_WALLET_FAILURE, payload: error };
  },
  signInStart() {
    return { type: AUTH_ACTIONS.SIGN_IN_START };
  },
  signInSuccess(user: TokenForgeUser | null) {
    return { type: AUTH_ACTIONS.SIGN_IN_SUCCESS, payload: user };
  },
  signInFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.SIGN_IN_FAILURE, payload: error };
  },
  signUpStart() {
    return { type: AUTH_ACTIONS.SIGN_UP_START };
  },
  signUpSuccess(user: TokenForgeUser | null) {
    return { type: AUTH_ACTIONS.SIGN_UP_SUCCESS, payload: user };
  },
  signUpFailure(error: AuthError) {
    return { type: AUTH_ACTIONS.SIGN_UP_FAILURE, payload: error };
  },
  setWalletProviderStatus(hasWalletProvider: boolean) {
    return {
      type: AUTH_ACTIONS.SET_WALLET_PROVIDER_STATUS,
      payload: { hasWalletProvider },
    };
  },
  setWalletError(error: AuthError) {
    return { type: AUTH_ACTIONS.SET_WALLET_ERROR, payload: error };
  },
  clearWalletError() {
    return { type: AUTH_ACTIONS.CLEAR_WALLET_ERROR };
  },
};
