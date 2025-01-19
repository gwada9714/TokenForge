import { auth } from '../../../../config/firebase';
import { firebaseAuth } from '../firebaseAuth';
import { Auth, User } from 'firebase/auth';

// Mock des dépendances Firebase
jest.mock('../../../../config/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signInWithCustomToken: jest.fn(),
    signOut: jest.fn(),
  } as unknown as Auth,
}));

// Mock de fetch pour les appels API
global.fetch = jest.fn();

describe('firebaseAuth', () => {
  const mockUser = {
    uid: '123',
    email: 'test@tokenforge.eth',
    emailVerified: false,
    getIdTokenResult: jest.fn().mockResolvedValue({
      claims: { walletAddress: '0x123' },
    }),
    reload: jest.fn(),
  } as unknown as User;

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });
  });

  describe('signInWithWallet', () => {
    const mockWalletAddress = '0x123';
    const mockSignature = '0xabc';
    const mockToken = 'mock-jwt-token';

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: mockToken }),
      });
      (auth.signInWithCustomToken as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
    });

    it('should sign in successfully with wallet', async () => {
      const session = await firebaseAuth.signInWithWallet(
        mockWalletAddress,
        mockSignature
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/wallet'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            walletAddress: mockWalletAddress,
            signature: mockSignature,
          }),
        })
      );

      expect(auth.signInWithCustomToken).toHaveBeenCalledWith(mockToken);
      expect(session).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        customClaims: { walletAddress: '0x123' },
      });
    });

    it('should handle API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(
        firebaseAuth.signInWithWallet(mockWalletAddress, mockSignature)
      ).rejects.toEqual(
        expect.objectContaining({
          code: 'AUTH_003',
        })
      );
    });

    it('should handle Firebase error', async () => {
      const mockError = new Error('Firebase error');
      (auth.signInWithCustomToken as jest.Mock).mockRejectedValue(mockError);

      await expect(
        firebaseAuth.signInWithWallet(mockWalletAddress, mockSignature)
      ).rejects.toEqual(
        expect.objectContaining({
          code: 'AUTH_003',
          originalError: mockError,
        })
      );
    });
  });

  describe('sendVerificationEmail', () => {
    beforeEach(() => {
      (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
        callback(mockUser);
        return jest.fn();
      });
    });

    it('should send verification email successfully', async () => {
      const sendEmailVerification = jest.fn().mockResolvedValue(undefined);
      const mockUserWithSendEmail = {
        ...mockUser,
        sendEmailVerification,
      };

      (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
        callback(mockUserWithSendEmail);
        return jest.fn();
      });

      await firebaseAuth.sendVerificationEmail();
      expect(sendEmailVerification).toHaveBeenCalled();
    });

    it('should handle no user error', async () => {
      (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      await expect(firebaseAuth.sendVerificationEmail()).rejects.toEqual(
        expect.objectContaining({
          code: 'AUTH_004',
        })
      );
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (auth.signOut as jest.Mock).mockResolvedValue(undefined);

      await firebaseAuth.signOut();
      expect(auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const mockError = new Error('Sign out failed');
      (auth.signOut as jest.Mock).mockRejectedValue(mockError);

      await expect(firebaseAuth.signOut()).rejects.toEqual(
        expect.objectContaining({
          code: 'AUTH_004',
          originalError: mockError,
        })
      );
    });
  });

  describe('session management', () => {
    it('should return current session', () => {
      (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
        callback(mockUser);
        return jest.fn();
      });

      const session = firebaseAuth.getCurrentSession();
      expect(session).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
      });
    });

    it('should handle session changes', () => {
      const mockCallback = jest.fn();
      firebaseAuth.onSessionChange(mockCallback);

      // Simuler un changement d'état d'authentification
      const authStateCallback = (auth.onAuthStateChanged as jest.Mock).mock.calls[0][0];
      authStateCallback(mockUser);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: mockUser.uid,
          email: mockUser.email,
          emailVerified: mockUser.emailVerified,
        })
      );
    });

    it('should refresh session', async () => {
      (auth.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
        callback(mockUser);
        return jest.fn();
      });

      await firebaseAuth.refreshSession();
      expect(mockUser.reload).toHaveBeenCalled();
    });
  });
});
