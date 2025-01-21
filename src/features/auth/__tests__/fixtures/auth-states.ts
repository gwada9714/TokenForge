import { TokenForgeAuthState } from '../../types/auth'

export const initialAuthState: TokenForgeAuthState = {
  status: 'idle',
  user: null,
  error: null,
  isAuthenticated: false,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null,
  },
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
}

export const authenticatedState: TokenForgeAuthState = {
  ...initialAuthState,
  status: 'authenticated',
  isAuthenticated: true,
  user: {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
    metadata: {
      creationTime: '2025-01-21T01:42:10Z',
      lastSignInTime: '2025-01-21T01:42:10Z',
    },
  },
}

export const connectedWalletState: TokenForgeAuthState = {
  ...authenticatedState,
  walletState: {
    isConnected: true,
    address: '0x1234567890abcdef',
    chainId: 1,
    isCorrectNetwork: true,
    provider: {} as any,
  },
}
