import { describe, it, expect, vi } from 'vitest';
import { authReducer, initialState } from '../authReducer';
import { authActions } from '../authActions';
import { AuthErrorCode } from '../../errors/AuthError';
import { TokenForgeUser } from '../../types/auth';
import { User as FirebaseUser } from 'firebase/auth';

const mockUser: TokenForgeUser = {
  uid: '123',
  email: 'test@example.com',
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  reload: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
  getIdTokenResult: vi.fn(),
  isAdmin: false,
  canCreateToken: true,
  canUseServices: true,
  metadata: {
    creationTime: '2025-02-10',
    lastSignInTime: '2025-02-10',
    lastLoginTime: Date.now(),
    walletAddress: undefined,
    chainId: undefined,
    customMetadata: {}
  },
  displayName: null,
  phoneNumber: null,
  photoURL: null,
  providerId: 'password',
  toJSON: () => ({})
} as unknown as TokenForgeUser & FirebaseUser;

// Utiliser la définition du wallet depuis le reducer
const mockWalletState = {
  ...initialState.wallet,
  isCorrectNetwork: false,
  walletClient: null
};

describe('authReducer', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' } as any);
      expect(state).toEqual(initialState);
    });
  });

  describe('Login Flow', () => {
    it('should handle login start', () => {
      const state = authReducer(initialState, authActions.loginStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login success', () => {
      const state = authReducer(initialState, authActions.loginSuccess(mockUser));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('should handle login failure', () => {
      const mockError = {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid credentials'
      };

      const state = authReducer(initialState, authActions.loginFailure(mockError));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toEqual(mockError);
    });
  });

  describe('Logout', () => {
    const loggedInState = {
      ...initialState,
      status: 'authenticated',
      isAuthenticated: true,
      user: mockUser,
      error: null,
      wallet: mockWalletState,
      loading: false,
      isAdmin: false,
      canCreateToken: true,
      canUseServices: true
    };

    it('should handle logout', () => {
      const state = authReducer(loggedInState, authActions.logout());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('Wallet State', () => {
    it('should handle wallet update', () => {
      const mockWalletData = {
        address: '0x123' as `0x${string}`,
        isConnected: true,
        chainId: 1,
        isCorrectNetwork: true
      };

      const state = authReducer(initialState, authActions.updateWallet(mockWalletData));
      expect(state.wallet.address).toBe(mockWalletData.address);
      expect(state.wallet.isConnected).toBe(mockWalletData.isConnected);
      expect(state.wallet.chainId).toBe(mockWalletData.chainId);
    });
  });

  describe('Error Handling', () => {
    it('should handle set error', () => {
      const mockError = {
        code: AuthErrorCode.NETWORK_MISMATCH,
        message: 'Wrong network'
      };

      const state = authReducer(initialState, authActions.setError(mockError));
      expect(state.error).toEqual(mockError);
    });

    it('should handle clear error', () => {
      const stateWithError = {
        ...initialState,
        error: {
          code: AuthErrorCode.NETWORK_MISMATCH,
          message: 'Wrong network'
        }
      };

      const state = authReducer(stateWithError, authActions.clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('User Updates', () => {
    const loggedInState = {
      ...initialState,
      status: 'authenticated',
      isAuthenticated: true,
      user: mockUser,
      error: null,
      wallet: mockWalletState,
      loading: false,
      isAdmin: false,
      canCreateToken: true,
      canUseServices: true
    };

    it('should handle user update', () => {
      const updates = {
        isAdmin: true,
        canCreateToken: false
      };

      const state = authReducer(loggedInState, authActions.updateUser(updates));
      expect(state.user).toEqual({
        ...mockUser,
        ...updates
      });
    });
  });
});
