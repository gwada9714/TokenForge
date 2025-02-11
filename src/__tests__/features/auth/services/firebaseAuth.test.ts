import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { firebaseAuth } from '../../../../features/auth/services/firebaseAuth';
import { getFirebaseServices } from '../../../../config/firebase';
import { AuthErrorCode } from '../../../../features/auth/errors/AuthError';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Mock Firebase services
vi.mock('../../../../config/firebase', () => ({
  getFirebaseServices: vi.fn(() => ({
    auth: {
      currentUser: null,
      signInWithEmailAndPassword: vi.fn(),
      signInWithPopup: vi.fn(),
      createUserWithEmailAndPassword: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      updateProfile: vi.fn(),
      signOut: vi.fn()
    }
  }))
}));

describe('Firebase Auth Service', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    phoneNumber: null,
    photoURL: null,
    emailVerified: false,
    isAnonymous: false,
    metadata: {
      creationTime: '123',
      lastSignInTime: '456'
    },
    providerData: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('waitForAuthInit', () => {
    it('should wait for auth initialization', async () => {
      const mockAuth = { onAuthStateChanged: vi.fn((cb) => cb(null)) };
      vi.mocked(getFirebaseServices).mockReturnValue({ auth: mockAuth } as any);

      await firebaseAuth.waitForAuthInit();
      expect(mockAuth.onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in with email successfully', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ user: mockUser });
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { signInWithEmailAndPassword: mockSignIn }
      } as any);

      const result = await firebaseAuth.signInWithEmail('test@example.com', 'password');
      expect(result).toMatchObject({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });

    it('should throw AuthError on sign in failure', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid password'));
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { signInWithEmailAndPassword: mockSignIn }
      } as any);

      await expect(firebaseAuth.signInWithEmail('test@example.com', 'wrong')).rejects
        .toMatchObject({ code: AuthErrorCode.SIGN_IN_ERROR });
    });
  });

  describe('signInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ user: mockUser });
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { signInWithPopup: mockSignIn }
      } as any);

      const result = await firebaseAuth.signInWithGoogle();
      expect(result).toMatchObject({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockCreate = vi.fn().mockResolvedValue({ user: mockUser });
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { createUserWithEmailAndPassword: mockCreate }
      } as any);

      const result = await firebaseAuth.createUser('new@example.com', 'password');
      expect(result).toMatchObject({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email', async () => {
      const mockReset = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { sendPasswordResetEmail: mockReset }
      } as any);

      await firebaseAuth.resetPassword('test@example.com');
      expect(mockReset).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: {
          currentUser: { ...mockUser, updateProfile: mockUpdate },
        }
      } as any);

      await firebaseAuth.updateUserProfile('New Name');
      expect(mockUpdate).toHaveBeenCalledWith(expect.anything(), { displayName: 'New Name' });
    });

    it('should throw error when no user is signed in', async () => {
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { currentUser: null }
      } as any);

      await expect(firebaseAuth.updateUserProfile('New Name')).rejects
        .toMatchObject({ code: AuthErrorCode.USER_NOT_FOUND });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when signed in', () => {
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { currentUser: mockUser }
      } as any);

      const result = firebaseAuth.getCurrentUser();
      expect(result).toMatchObject({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });

    it('should return null when no user is signed in', () => {
      vi.mocked(getFirebaseServices).mockReturnValue({
        auth: { currentUser: null }
      } as any);

      const result = firebaseAuth.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});
