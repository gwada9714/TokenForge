import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { TokenForgeUser } from '../types';
import { errorService } from './errorService';
import { AUTH_ERROR_CODES } from '../errors/AuthError';
import { logService } from './logService';
import { app } from '../../../config/firebase';

const LOG_CATEGORY = 'FirebaseService';

class FirebaseService {
  private static instance: FirebaseService;
  private auth = getAuth(app);

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private convertToTokenForgeUser(firebaseUser: FirebaseUser): TokenForgeUser {
    if (!firebaseUser) {
      throw errorService.createAuthError(
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        'User not found'
      );
    }

    return {
      ...firebaseUser,
      metadata: {
        creationTime: firebaseUser.metadata?.creationTime || '',
        lastSignInTime: firebaseUser.metadata?.lastSignInTime || '',
      },
      isAdmin: firebaseUser.email?.endsWith('@tokenforge.com') || false,
      canCreateToken: false,
      canUseServices: true,
    };
  }

  async signIn(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.convertToTokenForgeUser(userCredential.user);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Sign in failed', authError);
      throw authError;
    }
  }

  async signUp(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return this.convertToTokenForgeUser(userCredential.user);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Sign up failed', authError);
      throw authError;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Sign out failed', authError);
      throw authError;
    }
  }

  async updateProfile(displayName?: string, photoURL?: string): Promise<TokenForgeUser> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          'No user is currently signed in'
        );
      }

      const updateData: { displayName?: string; photoURL?: string } = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (photoURL !== undefined) updateData.photoURL = photoURL;

      await firebaseUpdateProfile(user, updateData);
      return this.convertToTokenForgeUser(user);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Profile update failed', authError);
      throw authError;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Password reset failed', authError);
      throw authError;
    }
  }

  onAuthStateChanged(callback: (user: TokenForgeUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? this.convertToTokenForgeUser(user) : null);
    });
  }

  async getUserData(uid: string): Promise<TokenForgeUser> {
    try {
      const user = this.auth.currentUser;
      if (!user || user.uid !== uid) {
        throw errorService.createAuthError(
          AUTH_ERROR_CODES.USER_NOT_FOUND,
          'User not found'
        );
      }
      return this.convertToTokenForgeUser(user);
    } catch (error) {
      const authError = errorService.handleError(error);
      logService.error(LOG_CATEGORY, 'Get user data failed', authError);
      throw authError;
    }
  }

  getCurrentUser(): TokenForgeUser | null {
    const user = this.auth.currentUser;
    return user ? this.convertToTokenForgeUser(user) : null;
  }

  public async refreshToken(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    await user.getIdToken(true); // Force refresh du token
  }
}

export const firebaseService = FirebaseService.getInstance();
