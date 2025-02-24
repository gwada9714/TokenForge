import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { AuthSyncService } from '@/services/authSyncService';
import { SecureStorageService } from '@/services/secureStorageService';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

// Mock Viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn()
}));

// Mock Services
vi.mock('@/services/authSyncService', () => ({
  AuthSyncService: vi.fn(() => ({
    subscribeToAuthChanges: vi.fn(),
    broadcastAuthState: vi.fn(),
    unsubscribeFromAuthChanges: vi.fn(),
    cleanup: vi.fn()
  }))
}));

vi.mock('@/services/secureStorageService', () => ({
  SecureStorageService: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }))
}));

describe('useTokenForgeAuth', () => {
  let mockStore: any;
  let mockAuthSync: any;
  let mockSecureStorage: any;
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Redux store
    mockStore = configureStore({
      reducer: {
        auth: authReducer
      }
    });

    // Setup Firebase mocks
    vi.mocked(getAuth).mockReturnValue({
      currentUser: null,
      onAuthStateChanged: vi.fn()
    } as any);

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: mockUser
    } as any);

    vi.mocked(signOut).mockResolvedValue();

    // Setup Viem mocks
    vi.mocked(createPublicClient).mockReturnValue({
      chain: mainnet,
      request: vi.fn()
    } as any);

    vi.mocked(createWalletClient).mockReturnValue({
      account: {
        address: '0x1234...',
        type: 'json-rpc'
      },
      chain: mainnet,
      request: vi.fn()
    } as any);

    // Setup service mocks
    mockAuthSync = new AuthSyncService();
    mockSecureStorage = new SecureStorageService('test-key');
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles email login successfully', async () => {
    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    await act(async () => {
      await result.current.loginWithEmail('test@example.com', 'password');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'test@example.com',
      'password'
    );
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(mockAuthSync.broadcastAuthState).toHaveBeenCalled();
  });

  it('handles wallet connection and authentication', async () => {
    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(createWalletClient).toHaveBeenCalled();
    expect(result.current.walletState.isConnected).toBe(true);
    expect(result.current.walletState.address).toBeTruthy();
  });

  it('handles logout', async () => {
    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    // First login
    await act(async () => {
      await result.current.loginWithEmail('test@example.com', 'password');
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('auth_session');
    expect(mockAuthSync.broadcastAuthState).toHaveBeenCalled();
  });

  it('synchronizes state across tabs', async () => {
    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    const mockAuthState = {
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null
    };

    await act(async () => {
      // Simulate receiving auth state from another tab
      const callback = vi.mocked(mockAuthSync.subscribeToAuthChanges).mock.calls[0][0];
      callback(mockAuthState);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles authentication errors', async () => {
    const mockError = new Error('Invalid credentials');
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    await act(async () => {
      try {
        await result.current.loginWithEmail('test@example.com', 'wrong-password');
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(mockAuthSync.broadcastAuthState).toHaveBeenCalled();
  });

  it('persists authentication state', async () => {
    vi.mocked(mockSecureStorage.getItem).mockReturnValue({
      user: mockUser,
      timestamp: Date.now()
    });

    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles session expiration', async () => {
    vi.mocked(mockSecureStorage.getItem).mockReturnValue({
      user: mockUser,
      timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours old
    });

    const { result } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(mockSecureStorage.removeItem).toHaveBeenCalledWith('auth_session');
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = renderHook(() => useTokenForgeAuth(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    unmount();

    expect(mockAuthSync.cleanup).toHaveBeenCalled();
    expect(mockAuthSync.unsubscribeFromAuthChanges).toHaveBeenCalled();
  });
});
