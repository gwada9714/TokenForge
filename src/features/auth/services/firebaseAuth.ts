import { 
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword as firebaseCreateUser,
  sendPasswordResetEmail as firebaseSendReset,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  NextOrObserver,
  Unsubscribe,
  Auth
} from 'firebase/auth';
import { getFirebaseServices, initializeFirebaseServices } from '../../../config/firebase';
import { createAuthError, AuthComponentNotRegisteredError } from '../errors/AuthError';
import { TokenForgeUser, TokenForgeUserMetadata } from '../../../types/authTypes';
import { logger, LogLevel } from '../../../utils/firebase-logger';

export class FirebaseAuthService {
  private static instance: FirebaseAuthService | null = null;
  private auth: Auth;
  private googleProvider: GoogleAuthProvider;
  private currentUser: FirebaseUser | null = null;
  private authStateUnsubscribe: Unsubscribe | null = null;

  private constructor(authInstance: Auth) {
    this.auth = authInstance;
    this.validateAuthReady();
    this.googleProvider = new GoogleAuthProvider();
    this.setupAuthStateListener();
  }

  private validateAuthReady() {
    if (!this.auth || !this.auth.app) {
      throw new AuthComponentNotRegisteredError('Le service d\'authentification n\'est pas initialisé correctement');
    }
  }

  static async getInstance(): Promise<FirebaseAuthService> {
    if (!FirebaseAuthService.instance) {
      // Initialiser les services Firebase si ce n'est pas déjà fait
      await initializeFirebaseServices();
      const { auth } = getFirebaseServices();
      FirebaseAuthService.instance = new FirebaseAuthService(auth);
    }
    return FirebaseAuthService.instance;
  }

  async signInWithEmail(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await firebaseSignInWithEmail(this.auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError('AUTH/SIGN_IN_ERROR', error);
    }
  }

  async signInWithGoogle(): Promise<TokenForgeUser> {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError('AUTH/GOOGLE_SIGN_IN_ERROR', error);
    }
  }

  async createUser(email: string, password: string): Promise<TokenForgeUser> {
    try {
      const userCredential = await firebaseCreateUser(this.auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw createAuthError('AUTH/CREATE_USER_ERROR', error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await firebaseSendReset(this.auth, email);
    } catch (error) {
      throw createAuthError('AUTH/RESET_PASSWORD_ERROR', error);
    }
  }

  async updateUserProfile(displayName: string): Promise<void> {
    if (!this.currentUser) {
      throw createAuthError('AUTH/USER_NOT_FOUND');
    }

    try {
      await firebaseUpdateProfile(this.currentUser, { displayName });
    } catch (error) {
      throw createAuthError('AUTH/UPDATE_PROFILE_ERROR', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error) {
      throw createAuthError('AUTH/SIGN_OUT_ERROR', error);
    }
  }

  getCurrentUser(): TokenForgeUser | null {
    return this.currentUser ? this.mapFirebaseUser(this.currentUser) : null;
  }

  onAuthStateChanged(observer: NextOrObserver<TokenForgeUser | null>): Unsubscribe {
    return onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (typeof observer === 'function') {
        observer(user ? this.mapFirebaseUser(user) : null);
      } else {
        if (observer.next) {
          observer.next(user ? this.mapFirebaseUser(user) : null);
        }
      }
    });
  }

  private mapFirebaseUser(user: FirebaseUser): TokenForgeUser {
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        photoURL: provider.photoURL
      }))
    };
  }
}

// Export d'une fonction pour obtenir l'instance
export const getFirebaseAuthService = FirebaseAuthService.getInstance;

// Export d'une instance par défaut (initialisée de manière asynchrone)
let defaultInstance: FirebaseAuthService | null = null;
getFirebaseAuthService().then(instance => {
  defaultInstance = instance;
}).catch(error => {
  console.error('Erreur lors de l\'initialisation du service Firebase Auth:', error);
});

export { defaultInstance as firebaseAuth };
