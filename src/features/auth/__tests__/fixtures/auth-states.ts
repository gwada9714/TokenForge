import { TokenForgeAuthState, TokenForgeUser } from "../../types/auth";
import { WalletClient } from "viem";

const mockUser: TokenForgeUser = {
  uid: "test-uid",
  email: "test@example.com",
  emailVerified: true,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
  isAnonymous: false,
  displayName: "Test User",
  photoURL: null,
  phoneNumber: null,
  tenantId: null,
  providerId: "password",
  providerData: [],
  refreshToken: "",
  metadata: {
    creationTime: "2025-01-21T01:42:10Z",
    lastSignInTime: "2025-01-21T01:42:10Z",
    lastLoginTime: Date.now(),
  },
  delete: async () => Promise.resolve(),
  getIdToken: async () => Promise.resolve("mock-token"),
  getIdTokenResult: async () =>
    Promise.resolve({
      token: "mock-token",
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: "password",
      signInSecondFactor: null,
      claims: {},
    }),
  reload: async () => Promise.resolve(),
  toJSON: () => ({
    uid: "test-uid",
    email: "test@example.com",
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    stsTokenManager: {
      refreshToken: "",
      accessToken: "",
      expirationTime: 0,
    },
  }),
};

export const initialAuthState: TokenForgeAuthState = {
  status: "idle",
  user: null,
  error: null,
  isAuthenticated: false,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null,
    walletClient: null,
  },
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
};

export const authenticatedState: TokenForgeAuthState = {
  ...initialAuthState,
  status: "authenticated",
  isAuthenticated: true,
  user: mockUser,
};

export const connectedWalletState: TokenForgeAuthState = {
  ...authenticatedState,
  walletState: {
    isConnected: true,
    address: "0x1234567890abcdef",
    chainId: 1,
    isCorrectNetwork: true,
    provider: {} as any,
    walletClient: {} as WalletClient,
  },
};
