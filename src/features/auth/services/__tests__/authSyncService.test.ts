import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authSyncService } from '../authSyncService';
import { firebaseService } from '../firebaseService';
import { errorService } from '../errorService';
import { TokenForgeAuthState, WalletState } from '../../types';
import { AUTH_ERROR_CODES } from '../../errors/AuthError';
import type { PublicClient, WalletClient } from '@wagmi/core';

// Mock des services
vi.mock('../firebaseService');
vi.mock('../errorService');

describe('AuthSyncService', () => {
  let mockWalletState: WalletState;
  let mockAuthState: TokenForgeAuthState;

  const mockProvider: PublicClient = {
    account: undefined,
    batch: undefined,
    cacheTime: 0,
    chain: {
      id: 1,
      name: 'Ethereum',
      network: 'mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [''] }, public: { http: [''] } }
    },
    key: 'mock',
    name: 'Mock Provider',
    pollingInterval: 4000,
    request: vi.fn(),
    transport: { type: 'mock' },
    type: 'publicClient',
    uid: 'mock'
  } as PublicClient;

  beforeEach(() => {
    vi.clearAllMocks();

    // État du wallet par défaut
    mockWalletState = {
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      provider: mockProvider,
      walletClient: null
    };

    // État d'authentification par défaut
    mockAuthState = {
      status: 'idle',
      isAuthenticated: false,
      user: null,
      error: null,
      walletState: mockWalletState,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false
    };

    // Mock de window.ethereum
    (global as any).ethereum = {
      request: vi.fn()
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete (global as any).ethereum;
  });

  describe('synchronizeWalletAndAuth', () => {
    it('should handle wallet disconnection when user is authenticated', async () => {
      // Arrange
      mockAuthState.isAuthenticated = true;
      mockWalletState.isConnected = false;

      // Act
      await authSyncService.synchronizeWalletAndAuth(mockWalletState, mockAuthState);

      // Assert
      expect(firebaseService.signOut).toHaveBeenCalled();
    });

    it('should handle wallet connection when user is not authenticated', async () => {
      // Arrange
      mockAuthState.isAuthenticated = false;
      mockWalletState = {
        ...mockWalletState,
        isConnected: true,
        address: '0x123',
        chainId: 1,
        isCorrectNetwork: true,
        provider: mockProvider,
        walletClient: {} as WalletClient
      };

      // Mock signature
      (global as any).ethereum.request.mockResolvedValueOnce('0xsignature');

      // Act
      await authSyncService.synchronizeWalletAndAuth(mockWalletState, mockAuthState);

      // Assert
      expect(global.ethereum.request).toHaveBeenCalledWith({
        method: 'personal_sign',
        params: expect.any(Array)
      });
    });

    it('should throw error when network is incorrect', async () => {
      // Arrange
      mockAuthState.isAuthenticated = false;
      mockWalletState = {
        ...mockWalletState,
        isConnected: true,
        address: '0x123',
        chainId: 1,
        isCorrectNetwork: false,
        provider: mockProvider,
        walletClient: {} as WalletClient
      };

      // Act & Assert
      await expect(
        authSyncService.synchronizeWalletAndAuth(mockWalletState, mockAuthState)
      ).rejects.toThrow();

      expect(errorService.createAuthError).toHaveBeenCalledWith(
        AUTH_ERROR_CODES.NETWORK_MISMATCH,
        expect.any(String)
      );
    });

    it('should throw error when wallet address is missing', async () => {
      // Arrange
      mockAuthState.isAuthenticated = false;
      mockWalletState = {
        ...mockWalletState,
        isConnected: true,
        isCorrectNetwork: true,
        provider: mockProvider,
        walletClient: {} as WalletClient
      };

      // Act & Assert
      await expect(
        authSyncService.synchronizeWalletAndAuth(mockWalletState, mockAuthState)
      ).rejects.toThrow();

      expect(errorService.createAuthError).toHaveBeenCalledWith(
        AUTH_ERROR_CODES.WALLET_NOT_FOUND,
        expect.any(String)
      );
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start token refresh interval', () => {
      // Act
      authSyncService.startTokenRefresh();
      vi.advanceTimersByTime(55 * 60 * 1000); // 55 minutes

      // Assert
      expect(firebaseService.refreshToken).toHaveBeenCalled();
    });

    it('should stop token refresh interval', () => {
      // Arrange
      authSyncService.startTokenRefresh();

      // Act
      authSyncService.stopTokenRefresh();
      vi.advanceTimersByTime(55 * 60 * 1000); // 55 minutes

      // Assert
      expect(firebaseService.refreshToken).not.toHaveBeenCalled();
    });

    it('should handle refresh token failure gracefully', async () => {
      // Arrange
      const mockError = new Error('Refresh failed');
      (firebaseService.refreshToken as vi.Mock).mockRejectedValue(mockError);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation();

      // Act
      authSyncService.startTokenRefresh();
      vi.advanceTimersByTime(55 * 60 * 1000); // 55 minutes

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Token refresh failed:', mockError);
      consoleSpy.mockRestore();
    });
  });
});
