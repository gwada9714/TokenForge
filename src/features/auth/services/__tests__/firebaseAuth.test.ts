import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  type User,
  type NextOrObserver,
  type UserCredential,
} from 'firebase/auth';
import { firebaseAuth } from '../firebaseAuth';
import { AuthError } from '@/features/auth/errors/AuthError';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('firebase/auth');
vi.mock('@/config/firebase');

describe('firebaseAuth', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: false,
    providerData: [{ providerId: 'wallet' }],
    getIdTokenResult: vi.fn().mockResolvedValue({
      claims: {
        walletAddress: '0x123',
      },
    }),
    reload: vi.fn(),
  } as unknown as User;

  const mockUserCredential: UserCredential = {
    user: mockUser,
    providerId: 'wallet',
    operationType: 'signIn'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(signInWithCustomToken).mockResolvedValue(mockUserCredential);
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback: NextOrObserver<User | null>) => {
      if (typeof callback === 'function') {
        callback(mockUser);
      }
      return () => {};
    });
  });

  describe('signInWithWallet', () => {
    it('devrait se connecter avec succès', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token' }),
      } as Response);

      const session = await firebaseAuth.signInWithWallet('0x123', 'signature');

      expect(session).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        provider: 'wallet',
        customClaims: {
          walletAddress: '0x123',
        },
      });
    });

    it('devrait gérer les erreurs de connexion', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(firebaseAuth.signInWithWallet('0x123', 'signature'))
        .rejects.toThrow(AuthError);
    });
  });

  describe('signOut', () => {
    it('devrait se déconnecter avec succès', async () => {
      vi.mocked(signOut).mockResolvedValueOnce();
      await expect(firebaseAuth.signOut()).resolves.not.toThrow();
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      vi.mocked(signOut).mockRejectedValueOnce(new Error('Sign out failed'));
      await expect(firebaseAuth.signOut()).rejects.toThrow(AuthError);
    });
  });

  describe('session management', () => {
    it('devrait retourner null quand aucun utilisateur n\'est connecté', async () => {
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback: NextOrObserver<User | null>) => {
        if (typeof callback === 'function') {
          callback(null);
        }
        return () => {};
      });

      const session = await firebaseAuth.getCurrentSession();
      expect(session).toBeNull();
    });

    it('devrait retourner la session courante', async () => {
      const session = await firebaseAuth.getCurrentSession();
      expect(session).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        provider: 'wallet',
        customClaims: {
          walletAddress: '0x123',
        },
      });
    });

    it('devrait notifier des changements de session', () => {
      return new Promise<void>((resolve) => {
        const unsubscribe = firebaseAuth.onSessionChange((session) => {
          expect(session).toEqual({
            uid: mockUser.uid,
            email: mockUser.email,
            emailVerified: mockUser.emailVerified,
            provider: 'wallet',
            customClaims: {
              walletAddress: '0x123',
            },
          });
          unsubscribe();
          resolve();
        });
      });
    });
  });
});
