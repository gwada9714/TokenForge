import { authReducer } from '../reducers/authReducer';
import { AuthError } from '../errors/AuthError';
import { TokenForgeUser, TokenForgeAuthState, WalletState, AuthStatus } from '../types/auth';
import { AUTH_ACTIONS } from '../actions/authActions';

const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  isAdmin: true,
  canCreateToken: true,
  canUseServices: true,
  isAnonymous: false,
  providerData: [],
  refreshToken: 'test-refresh-token',
  tenantId: null,
  displayName: null,
  photoURL: null,
  phoneNumber: null,
  metadata: {
    creationTime: '2025-01-21T01:48:12.000Z',
    lastSignInTime: '2025-01-21T01:48:12.000Z',
    lastLoginTime: Date.now()
  },
  // Firebase User methods
  delete: jest.fn(),
  getIdToken: jest.fn(),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn()
} as unknown as TokenForgeUser;

const mockWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  provider: null,
  walletClient: null
};

const initialState: TokenForgeAuthState = {
  status: 'idle' as AuthStatus,
  isAuthenticated: false,
  user: null,
  error: null,
  walletState: mockWalletState,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false
};

describe('authReducer', () => {
  it('devrait retourner l\'état initial', () => {
    expect(authReducer(undefined, { type: AUTH_ACTIONS.LOGIN_START })).toEqual(initialState);
  });

  it('devrait gérer auth/loginStart', () => {
    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_START
    });

    expect(nextState).toEqual({
      ...initialState,
      status: 'loading',
      error: null
    });
  });

  it('devrait gérer auth/loginSuccess', () => {
    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: mockUser
    });

    expect(nextState).toEqual({
      ...initialState,
      status: 'authenticated' as AuthStatus,
      isAuthenticated: true,
      user: mockUser,
      isAdmin: mockUser.isAdmin,
      canCreateToken: mockUser.canCreateToken,
      canUseServices: mockUser.canUseServices,
      error: null
    });
  });

  it('devrait gérer auth/loginFailure', () => {
    const error = new AuthError('AUTH_016', 'Invalid credentials');

    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: error
    });

    expect(nextState).toEqual({
      ...initialState,
      status: 'error' as AuthStatus,
      isAuthenticated: false,
      user: null,
      error
    });
  });

  it('devrait gérer auth/logout', () => {
    const stateWithUser = {
      ...initialState,
      status: 'authenticated' as AuthStatus,
      isAuthenticated: true,
      user: mockUser
    };

    const nextState = authReducer(stateWithUser, {
      type: AUTH_ACTIONS.LOGOUT
    });

    expect(nextState).toEqual(initialState);
  });

  it('devrait gérer auth/walletConnect', () => {
    const walletState = {
      isConnected: true,
      address: '0x123',
      chainId: 1,
      isCorrectNetwork: true,
      provider: { id: 'mock-provider' },
      walletClient: { id: 'mock-wallet' }
    };

    const nextState = authReducer(initialState, {
      type: AUTH_ACTIONS.WALLET_CONNECT,
      payload: walletState
    });

    expect(nextState).toEqual({
      ...initialState,
      status: 'wallet_connected' as AuthStatus,
      walletState
    });
  });

  it('devrait gérer auth/walletDisconnect', () => {
    const stateWithWallet = {
      ...initialState,
      status: 'wallet_connected' as AuthStatus,
      walletState: {
        isConnected: true,
        address: '0x123',
        chainId: 1,
        isCorrectNetwork: true,
        provider: { id: 'mock-provider' },
        walletClient: { id: 'mock-wallet' }
      }
    };

    const nextState = authReducer(stateWithWallet, {
      type: AUTH_ACTIONS.WALLET_DISCONNECT
    });

    expect(nextState).toEqual({
      ...initialState,
      status: 'idle' as AuthStatus,
      walletState: mockWalletState
    });
  });
});
