import { describe, it, expect, vi } from "vitest";
import { authReducer } from "../reducers/authReducer";
import { AuthError } from "../errors/AuthError";
import {
  TokenForgeUser,
  TokenForgeAuthState,
  WalletState,
  AuthStatus,
} from "../types/auth";
import { AUTH_ACTIONS } from "../actions/authActions";

const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
  emailVerified: true,
  isAdmin: true,
  canCreateToken: true,
  canUseServices: true,
  isAnonymous: false,
  providerData: [],
  refreshToken: "test-refresh-token",
  tenantId: null,
  displayName: null,
  photoURL: null,
  phoneNumber: null,
  metadata: {
    creationTime: "2025-01-21T01:48:12.000Z",
    lastSignInTime: "2025-01-21T01:48:12.000Z",
    lastLoginTime: Date.now(),
  },
  // Firebase User methods
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
} as unknown as TokenForgeUser;

const mockWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  provider: null,
  walletClient: null,
};

const initialState: TokenForgeAuthState = {
  status: "idle" as AuthStatus,
  isAuthenticated: false,
  user: null,
  error: null,
  walletState: mockWalletState,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
};

describe("authReducer", () => {
  it("devrait retourner l'état initial", () => {
    // Utiliser une action inconnue pour tester l'état initial
    expect(authReducer(undefined, { type: "UNKNOWN_ACTION" as any })).toEqual(
      initialState
    );
  });

  it("devrait gérer auth/loginStart", () => {
    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_START,
    });

    expect(nextState).toEqual({
      ...initialState,
      status: "loading",
      error: null,
    });
  });

  it("devrait gérer auth/loginSuccess", () => {
    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: mockUser,
    });

    expect(nextState).toEqual({
      ...initialState,
      status: "authenticated" as AuthStatus,
      isAuthenticated: true,
      user: mockUser,
      isAdmin: mockUser.isAdmin,
      canCreateToken: mockUser.canCreateToken,
      canUseServices: mockUser.canUseServices,
      error: null,
    });
  });

  it("devrait gérer auth/loginFailure", () => {
    const error = new AuthError("AUTH_016", "Invalid credentials");

    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: error,
    });

    expect(nextState).toEqual({
      ...initialState,
      status: "error" as AuthStatus,
      isAuthenticated: false,
      user: null,
      error,
    });
  });

  it("devrait gérer auth/logout", () => {
    const stateWithUser = {
      ...initialState,
      status: "authenticated" as AuthStatus,
      isAuthenticated: true,
      user: mockUser,
    };

    const nextState = authReducer(stateWithUser, {
      type: AUTH_ACTIONS.LOGOUT,
    });

    expect(nextState).toEqual(initialState);
  });

  it("devrait gérer auth/walletConnect", () => {
    const walletState = {
      isConnected: true,
      address: "0x123",
      chainId: 1,
      isCorrectNetwork: true,
      provider: { id: "mock-provider" },
      walletClient: { id: "mock-wallet" },
    };

    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.WALLET_CONNECT,
      payload: walletState,
    });

    expect(nextState).toEqual({
      ...initialState,
      status: "wallet_connected" as AuthStatus,
      walletState,
    });
  });

  it("devrait gérer auth/walletDisconnect", () => {
    const stateWithWallet = {
      ...initialState,
      status: "wallet_connected" as AuthStatus,
      walletState: {
        isConnected: true,
        address: "0x123",
        chainId: 1,
        isCorrectNetwork: true,
        provider: { id: "mock-provider" },
        walletClient: { id: "mock-wallet" },
      },
    };

    const nextState = authReducer(stateWithWallet, {
      type: AUTH_ACTIONS.WALLET_DISCONNECT,
    });

    expect(nextState).toEqual({
      ...initialState,
      status: "idle" as AuthStatus,
      walletState: mockWalletState,
    });
  });

  it("devrait gérer auth/walletNetworkChange avec un réseau supporté", () => {
    const stateWithWallet = {
      ...initialState,
      status: "wallet_connected" as AuthStatus,
      walletState: {
        isConnected: true,
        address: "0x123",
        chainId: 1,
        isCorrectNetwork: true,
        provider: { id: "mock-provider" },
        walletClient: { id: "mock-wallet" },
      },
    };

    const nextState = authReducer(stateWithWallet, {
      type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
      payload: { chainId: 1, isCorrectNetwork: true },
    });

    expect(nextState).toEqual({
      ...stateWithWallet,
      walletState: {
        ...stateWithWallet.walletState,
        chainId: 1,
        isCorrectNetwork: true,
      },
    });
  });

  it("devrait gérer auth/walletNetworkChange avec un réseau non supporté", () => {
    const stateWithWallet = {
      ...initialState,
      status: "wallet_connected" as AuthStatus,
      walletState: {
        isConnected: true,
        address: "0x123",
        chainId: 1,
        isCorrectNetwork: true,
        provider: { id: "mock-provider" },
        walletClient: { id: "mock-wallet" },
      },
    };

    const nextState = authReducer(stateWithWallet, {
      type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
      payload: { chainId: 999, isCorrectNetwork: false },
    });

    expect(nextState).toEqual({
      ...stateWithWallet,
      walletState: {
        ...stateWithWallet.walletState,
        chainId: 999,
        isCorrectNetwork: false,
      },
    });
  });

  it("devrait gérer auth/walletUpdateProvider", () => {
    const newProvider = { id: "new-mock-provider" };
    const stateWithWallet = {
      ...initialState,
      status: "wallet_connected" as AuthStatus,
      walletState: {
        isConnected: true,
        address: "0x123",
        chainId: 1,
        isCorrectNetwork: true,
        provider: { id: "mock-provider" },
        walletClient: { id: "mock-wallet" },
      },
    };

    const nextState = authReducer(stateWithWallet, {
      type: AUTH_ACTIONS.WALLET_UPDATE_PROVIDER,
      payload: { provider: newProvider },
    });

    expect(nextState).toEqual({
      ...stateWithWallet,
      walletState: {
        ...stateWithWallet.walletState,
        provider: newProvider,
      },
    });
  });

  it("devrait gérer auth/updateUser", () => {
    const stateWithUser = {
      ...initialState,
      status: "authenticated" as AuthStatus,
      isAuthenticated: true,
      user: mockUser,
    };

    const userUpdates = {
      displayName: "Test User",
      photoURL: "https://example.com/photo.jpg",
    };

    const nextState = authReducer(stateWithUser, {
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userUpdates,
    });

    expect(nextState).toEqual({
      ...stateWithUser,
      user: {
        ...mockUser,
        ...userUpdates,
      },
    });
  });

  it("devrait gérer auth/setError", () => {
    const error = new AuthError("AUTH_017", "Network error");

    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.SET_ERROR,
      payload: error,
    });

    expect(nextState).toEqual({
      ...initialState,
      error,
      status: "error" as AuthStatus,
    });
  });

  it("devrait gérer auth/clearError", () => {
    const stateWithError = {
      ...initialState,
      error: new AuthError("AUTH_017", "Network error"),
      status: "error" as AuthStatus,
    };

    const nextState = authReducer(stateWithError, {
      type: AUTH_ACTIONS.CLEAR_ERROR,
    });

    expect(nextState).toEqual({
      ...stateWithError,
      error: null,
      status: "idle" as AuthStatus,
    });
  });
});
