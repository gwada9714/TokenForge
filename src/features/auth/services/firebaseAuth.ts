import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  NextOrObserver,
  Unsubscribe
} from 'firebase/auth';
import { app } from '../../../config/firebase';
import { createAuthError, AUTH_ERROR_CODES } from '../errors/AuthError';
import { TokenForgeUser } from '../types';

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private auth = getAuth(app);
  private googleProvider: GoogleAuthProvider;
  private currentUser: FirebaseUser | null = null;

  private constructor() {
    this.googleProvider = new GoogleAuthProvider();
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  onAuthStateChanged(callback: NextOrObserver<FirebaseUser>): Unsubscribe {
    return onAuthStateChanged(this.auth, callback);
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.transformToTokenForgeUser(userCredential.user);
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  async signUp(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return this.transformToTokenForgeUser(userCredential.user);
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  async updateProfile(updates: Partial<TokenForgeUser>): Promise<void> {
    if (!this.currentUser) {
      throw createAuthError(AUTH_ERROR_CODES.USER_NOT_FOUND);
    }

    try {
      const { displayName, photoURL } = updates;
      if (displayName !== undefined || photoURL !== undefined) {
        await firebaseUpdateProfile(this.currentUser, { 
          displayName: displayName ?? this.currentUser.displayName,
          photoURL: photoURL ?? this.currentUser.photoURL
        });
      }
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  async updateProfileWithUser(user: FirebaseUser, displayName?: string, photoURL?: string): Promise<void> {
    try {
      await firebaseUpdateProfile(user, { displayName, photoURL });
    } catch (error: any) {
      throw createAuthError(error);
    }
  }

  private transformToTokenForgeUser(user: FirebaseUser): TokenForgeUser {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: true,
      metadata: {
        creationTime: user.metadata.creationTime || '',
        lastSignInTime: user.metadata.lastSignInTime || '',
        lastLoginTime: Date.now(),
        walletAddress: undefined,
        chainId: undefined
      }
    };
  }
}

export const firebaseAuth = FirebaseAuthService.getInstance();
