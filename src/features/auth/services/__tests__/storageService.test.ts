import { storageService } from '../storageService';
import { TokenForgeUser } from '../../types';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Auth State', () => {
    const mockUser: Partial<TokenForgeUser> = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      isAdmin: true,
      customMetadata: {
        creationTime: new Date().toISOString(),
      },
    };

    it('should save and retrieve auth state', () => {
      storageService.saveAuthState(mockUser as TokenForgeUser);
      const retrieved = storageService.getAuthState();
      
      expect(retrieved).toBeTruthy();
      expect(retrieved?.user?.uid).toBe(mockUser.uid);
      expect(retrieved?.user?.email).toBe(mockUser.email);
      expect(retrieved?.user?.isAdmin).toBe(mockUser.isAdmin);
      expect(retrieved?.user?.customMetadata).toEqual(mockUser.customMetadata);
    });

    it('should clear auth state', () => {
      storageService.saveAuthState(mockUser as TokenForgeUser);
      storageService.clearAuthState();
      
      const retrieved = storageService.getAuthState();
      expect(retrieved).toBeNull();
    });

    it('should handle expired auth state', () => {
      const oldState = {
        user: mockUser,
        lastLogin: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      };
      localStorage.setItem('tokenforge_auth', JSON.stringify(oldState));
      
      const retrieved = storageService.getAuthState();
      expect(retrieved).toBeNull();
    });
  });

  describe('Wallet State', () => {
    const mockWalletState = {
      isConnected: true,
      address: '0x123',
      chainId: 1,
      isCorrectNetwork: true,
    };

    it('should save and retrieve wallet state', () => {
      storageService.saveWalletState(mockWalletState);
      const retrieved = storageService.getWalletState();
      
      expect(retrieved).toBeTruthy();
      expect(retrieved?.isConnected).toBe(mockWalletState.isConnected);
      expect(retrieved?.address).toBe(mockWalletState.address);
      expect(retrieved?.chainId).toBe(mockWalletState.chainId);
    });

    it('should clear wallet state', () => {
      storageService.saveWalletState(mockWalletState);
      storageService.clearWalletState();
      
      const retrieved = storageService.getWalletState();
      expect(retrieved).toBeNull();
    });

    it('should handle expired wallet state', () => {
      const oldState = {
        ...mockWalletState,
        lastUpdate: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      };
      localStorage.setItem('tokenforge_wallet', JSON.stringify(oldState));
      
      const retrieved = storageService.getWalletState();
      expect(retrieved).toBeNull();
    });
  });

  describe('Clear All', () => {
    it('should clear both auth and wallet state', () => {
      storageService.saveAuthState({ uid: 'test' } as TokenForgeUser);
      storageService.saveWalletState({ address: '0x123' });
      
      storageService.clearAll();
      
      expect(storageService.getAuthState()).toBeNull();
      expect(storageService.getWalletState()).toBeNull();
    });
  });
});
