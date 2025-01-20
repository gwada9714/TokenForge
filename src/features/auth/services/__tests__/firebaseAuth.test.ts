import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '../firebaseAuth';
import { notificationService } from '../notificationService';
import { AuthError } from '../../errors/AuthError';
import type { User, UserCredential, Auth } from 'firebase/auth';

// Mock des services
vi.mock('firebase/auth');
vi.mock('../notificationService');

describe('firebaseAuth', () => {
  let mockUser: Partial<User>;
  let authStateCallback: ((user: User | null) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: false,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: vi.fn(),
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: { walletAddress: '0x123' },
      }),
      reload: vi.fn(),
      toJSON: vi.fn()
    };

    // Mock de onAuthStateChanged
    vi.mocked(onAuthStateChanged).mockImplementation((_auth: Auth, callback) => {
      if (typeof callback === 'function') {
        authStateCallback = callback;
      }
      return () => {};
    });
  });

  describe('signInWithWallet', () => {
    const mockWalletAddress = '0x123';
    const mockSignature = 'signature';
    const mockToken = 'mock-jwt-token';

    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken }),
      });
    });

    it('devrait se connecter avec succès', async () => {
      const mockCredential: UserCredential = {
        user: mockUser as User,
        providerId: null,
        operationType: 'signIn'
      };

      vi.mocked(signInWithCustomToken).mockResolvedValue(mockCredential);

      const result = await firebaseAuth.signInWithWallet(mockWalletAddress, mockSignature);

      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        customClaims: { walletAddress: '0x123' }
      });
      
      expect(signInWithCustomToken).toHaveBeenCalledWith(
        expect.anything(),
        mockToken
      );
      expect(notificationService.notify).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String)
      });
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const mockError = new Error('Auth error');
      vi.mocked(signInWithCustomToken).mockRejectedValue(mockError);

      await expect(firebaseAuth.signInWithWallet(mockWalletAddress, mockSignature)).rejects.toThrow(
        AuthError
      );
      expect(notificationService.notify).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String)
      });
    });
  });

  describe('signOut', () => {
    it('devrait se déconnecter avec succès', async () => {
      vi.mocked(signOut).mockResolvedValue();

      await firebaseAuth.signOut();

      expect(signOut).toHaveBeenCalled();
      expect(notificationService.notify).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String)
      });
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      const mockError = new Error('Sign out error');
      vi.mocked(signOut).mockRejectedValue(mockError);

      await expect(firebaseAuth.signOut()).rejects.toThrow(AuthError);
      expect(notificationService.notify).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String)
      });
    });
  });

  describe('session management', () => {
    it('devrait retourner la session courante', () => {
      if (authStateCallback) {
        authStateCallback(mockUser as User);
      }
      const session = firebaseAuth.getCurrentSession();
      expect(session).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified
      });
    });

    it('devrait notifier des changements de session', () => {
      const mockCallback = vi.fn();
      firebaseAuth.onSessionChange(mockCallback);
      
      if (authStateCallback) {
        authStateCallback(mockUser as User);
      }

      expect(mockCallback).toHaveBeenCalledWith({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified
      });
    });
  });
});
