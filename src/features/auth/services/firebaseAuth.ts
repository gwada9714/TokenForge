import { 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail as firebaseSendReset,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  NextOrObserver,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirebaseServices } from '@/config/firebase';
import { AuthErrorCode, createAuthError } from '../errors/AuthError';
import { TokenForgeUser } from '../../../types/authTypes';

export const firebaseAuth = {
  async waitForAuthInit() {
    const { auth } = getFirebaseServices();
    if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION, 'Firebase Auth n\'est pas initialisé');
    return new Promise((resolve) => onAuthStateChanged(auth, resolve));
  },

  async signInWithEmail(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      const userCredential = await firebaseSignInWithEmail(auth, email, password);
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError(AuthErrorCode.SIGN_IN_ERROR, error);
    }
  },

  async signInWithGoogle(): Promise<TokenForgeUser> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError(AuthErrorCode.GOOGLE_SIGN_IN_ERROR, error);
    }
  },

  async createUser(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      const userCredential = await firebaseCreateUser(auth, email, password);
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError(AuthErrorCode.CREATE_USER_ERROR, error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      await firebaseSendReset(auth, email);
    } catch (error) {
      throw createAuthError(AuthErrorCode.RESET_PASSWORD_ERROR, error);
    }
  },

  async updateUserProfile(displayName: string): Promise<void> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      const user = auth.currentUser;
      if (!user) {
        throw createAuthError(AuthErrorCode.USER_NOT_FOUND);
      }
      await firebaseUpdateProfile(user, { displayName });
    } catch (error) {
      throw createAuthError(AuthErrorCode.UPDATE_PROFILE_ERROR, error);
    }
  },

  async signOut(): Promise<void> {
    try {
      const { auth } = getFirebaseServices();
      if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
      await firebaseSignOut(auth);
    } catch (error) {
      throw createAuthError(AuthErrorCode.SIGN_OUT_ERROR, error);
    }
  },

  getCurrentUser(): TokenForgeUser | null {
    const { auth } = getFirebaseServices();
    if (!auth) return null;
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  },

  onAuthStateChanged(observer: NextOrObserver<TokenForgeUser | null>): () => void {
    const { auth } = getFirebaseServices();
    if (!auth) throw createAuthError(AuthErrorCode.INVALID_OPERATION);
    return onAuthStateChanged(auth, (user) => {
      if (typeof observer === 'function') {
        observer(user ? mapFirebaseUser(user) : null);
      } else {
        if (observer.next) {
          observer.next(user ? mapFirebaseUser(user) : null);
        }
      }
    });
  }
};

const mapFirebaseUser = (user: FirebaseUser): TokenForgeUser => {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    phoneNumber: user.phoneNumber || null,
    photoURL: user.photoURL || null,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    metadata: {
      creationTime: user.metadata.creationTime || '',
      lastSignInTime: user.metadata.lastSignInTime || ''
    },
    providerData: user.providerData.map(provider => ({
      providerId: provider?.providerId || '',
      uid: provider?.uid || '',
      displayName: provider?.displayName || '',
      email: provider?.email || '',
      phoneNumber: provider?.phoneNumber || null,
      photoURL: provider?.photoURL || null
    }))
  };
};
