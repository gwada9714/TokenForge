import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { createAuthError } from '../errors/AuthError';

export interface AuthSession {
  uid: string;
  emailVerified: boolean;
  email: string | null;
  customClaims?: {
    [key: string]: any;
  };
}

class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private currentUser: FirebaseUser | null = null;

  private constructor() {
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

  async signInWithWallet(walletAddress: string, signature: string): Promise<AuthSession> {
    try {
      // Appeler une Cloud Function Firebase pour vérifier la signature et générer un token
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with wallet');
      }

      const { token } = await response.json();
      
      // Se connecter avec le token personnalisé
      const userCredential = await signInWithCustomToken(auth, token);
      const { user } = userCredential;

      if (!user) {
        throw new Error('No user data after authentication');
      }

      return {
        uid: user.uid,
        emailVerified: user.emailVerified,
        email: user.email,
        customClaims: (await user.getIdTokenResult()).claims,
      };
    } catch (error) {
      throw createAuthError(
        'AUTH_003',
        'Failed to authenticate with wallet',
        { originalError: error }
      );
    }
  }

  async sendVerificationEmail(): Promise<void> {
    if (!this.currentUser) {
      throw createAuthError(
        'AUTH_004',
        'No authenticated user found'
      );
    }

    try {
      await sendEmailVerification(this.currentUser);
    } catch (error) {
      throw createAuthError(
        'AUTH_005',
        'Failed to send verification email',
        { originalError: error }
      );
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw createAuthError(
        'AUTH_004',
        'Failed to sign out',
        { originalError: error }
      );
    }
  }

  getCurrentSession(): AuthSession | null {
    const user = this.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      emailVerified: user.emailVerified,
      email: user.email,
      // Note: Les customClaims ne sont pas disponibles immédiatement,
      // ils doivent être récupérés via getIdTokenResult()
    };
  }

  async refreshSession(): Promise<void> {
    if (!this.currentUser) {
      throw createAuthError(
        'AUTH_004',
        'No authenticated user found'
      );
    }

    try {
      await this.currentUser.reload();
    } catch (error) {
      throw createAuthError(
        'AUTH_004',
        'Failed to refresh session',
        { originalError: error }
      );
    }
  }

  onSessionChange(callback: (session: AuthSession | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          callback({
            uid: user.uid,
            emailVerified: user.emailVerified,
            email: user.email,
            customClaims: idTokenResult.claims,
          });
        });
      } else {
        callback(null);
      }
    });
  }
}

export const firebaseAuth = FirebaseAuthService.getInstance();
