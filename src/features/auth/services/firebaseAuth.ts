import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { createAuthError } from '../errors/AuthError';

class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private currentUser: FirebaseUser | null = null;
  private googleProvider: GoogleAuthProvider;

  private constructor() {
    this.googleProvider = new GoogleAuthProvider();
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw createAuthError('AUTH_005', 'Failed to sign in with email and password', { originalError: error });
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(auth, this.googleProvider);
    } catch (error) {
      throw createAuthError('AUTH_005', 'Failed to sign in with Google', { originalError: error });
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw createAuthError('AUTH_005', 'Failed to sign out', { originalError: error });
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }
}

export const firebaseAuth = FirebaseAuthService.getInstance();
