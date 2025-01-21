import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

// Mocks
import { mockFirebaseAuth } from '../../__tests__/mocks/firebase';
import { mockSessionService, mockErrorService } from '../../__tests__/mocks/services';

// Mock modules
vi.mock('../../services/firebaseAuth', () => ({
  firebaseAuth: mockFirebaseAuth
}));

vi.mock('../../services/sessionService', () => ({
  sessionService: mockSessionService
}));

vi.mock('../../services/errorService', () => ({
  errorService: mockErrorService
}));

// Imports after mocks
import { useAuthState } from '../useAuthState';
import { TokenForgeUser, AuthStatus } from '../../types/auth';
import { AuthError } from '../../errors/AuthError';
import { TokenForgeAuthContext } from '../../context/TokenForgeAuthContext';

const mockDispatch = vi.fn();

const mockUser: TokenForgeUser = {
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
  providerId: 'firebase',
  metadata: {
    creationTime: '2025-01-21T01:48:12.000Z',
    lastSignInTime: '2025-01-21T01:48:12.000Z',
    lastLoginTime: Date.now(),
    walletAddress: undefined,
    chainId: undefined,
    customMetadata: {}
  },
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn()
} as unknown as TokenForgeUser;

const mockAuthState = {
  dispatch: mockDispatch,
  walletState: {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    provider: null,
    walletClient: null
  },
  status: 'idle' as AuthStatus,
  isAuthenticated: false,
  user: null,
  error: null,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TokenForgeAuthContext.Provider value={mockAuthState}>
    {children}
  </TokenForgeAuthContext.Provider>
);

describe('useAuthState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionService.getUserSession.mockResolvedValue({
      isAdmin: true,
      canCreateToken: true,
      canUseServices: true
    });
    mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return () => {};
    });
  });

  it('devrait initialiser avec l\'état par défaut', () => {
    const { result } = renderHook(() => useAuthState(), { wrapper: Wrapper });
    
    expect(result.current).toEqual({
      status: 'idle',
      isAuthenticated: false,
      user: null,
      error: null,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
      walletState: {
        isConnected: false,
        address: null,
        chainId: null,
        isCorrectNetwork: false,
        provider: null,
        walletClient: null
      },
      login: expect.any(Function),
      logout: expect.any(Function),
      dispatch: expect.any(Function)
    });
  });

  it('devrait gérer une authentification réussie', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    mockFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    const { result } = renderHook(() => useAuthState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'password'
    );
  });

  it('devrait gérer une erreur d\'authentification', async () => {
    const error = new AuthError('AUTH_016', 'Invalid credentials');
    mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(error);
    mockErrorService.handleError.mockReturnValue(error);

    const { result } = renderHook(() => useAuthState(), { wrapper: Wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  it('devrait gérer la déconnexion', async () => {
    mockFirebaseAuth.signOut.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useAuthState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
  });

  it('devrait nettoyer l\'abonnement Firebase à la déconnexion', () => {
    const unsubscribeMock = vi.fn();
    mockFirebaseAuth.onAuthStateChanged.mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => useAuthState(), { wrapper: Wrapper });
    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
