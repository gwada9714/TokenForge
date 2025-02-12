import { FirebaseError } from 'firebase/app';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User,
  sendEmailVerification,
  updateProfile,
  getIdToken,
  onIdTokenChanged
} from 'firebase/auth';
import { Firestore, collection, doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Functions, httpsCallable } from 'firebase/functions';
import { firebaseApp, auth, firestore, functions } from '../../../config/firebase';
import { AuthError, AuthErrorCode } from '../errors/AuthError';
import { ErrorService } from './errorService';
import { logger } from '../../../utils/firebase-logger';
import { TokenEncryption } from '../../../utils/token-encryption';
import * as Sentry from '@sentry/react';

const LOG_CATEGORY = 'FirebaseService';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class FirebaseService {
  private static instance: FirebaseService | null = null;
  private auth: Auth;
  private firestore: Firestore;
  private functions: Functions;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private tokenEncryption: TokenEncryption;

  private constructor() {
    this.auth = auth;
    this.firestore = firestore;
    this.functions = functions;
    this.tokenEncryption = TokenEncryption.getInstance();
    this.setupTokenRefresh();
  }

  public static getInstance(): FirebaseService {
    if (!this.instance) {
      this.instance = new FirebaseService();
      logger.info(LOG_CATEGORY, 'FirebaseService initialized successfully');
    }
    return this.instance;
  }

  private setupTokenRefresh(): void {
    onIdTokenChanged(this.auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user, true);
          await this.tokenEncryption.encryptAndStoreToken(token);
          await this.updateSessionToken(token);
          await this.updateUserLastActivity(user.uid);
        } catch (error) {
          logger.error(LOG_CATEGORY, 'Error refreshing token', error);
          Sentry.captureException(error);
        }
      } else {
        this.tokenEncryption.clearStoredToken();
      }
    });
  }

  private async updateSessionToken(token: string): Promise<void> {
    try {
      const updateSession = httpsCallable(this.functions, 'updateSessionToken');
      await updateSession({ token });
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error updating session token', error);
      Sentry.captureException(error);
    }
  }

  private async updateUserLastActivity(userId: string): Promise<void> {
    try {
      const userRef = doc(collection(firestore, 'users'), userId);
      await updateDoc(userRef, {
        lastActivity: serverTimestamp(),
        lastTokenRefresh: serverTimestamp()
      });
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error updating user activity', error);
      Sentry.captureException(error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, attempts: number = MAX_RETRY_ATTEMPTS): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        const delay = RETRY_DELAY * Math.pow(2, i); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        logger.warn(LOG_CATEGORY, `Retry attempt ${i + 1}/${attempts}`, { error });
      }
    }
    throw new Error('Max retry attempts reached');
  }

  public async signInWithEmail(email: string, password: string): Promise<User> {
    const startTime = Date.now();
    try {
      const userCredential = await this.retryOperation(() => 
        signInWithEmailAndPassword(this.auth, email, password)
      );
      
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        throw ErrorService.createAuthError(
          AuthErrorCode.EMAIL_NOT_VERIFIED,
          'Veuillez vérifier votre email avant de vous connecter'
        );
      }

      // Métriques de performance
      const authTime = Date.now() - startTime;
      Sentry.metrics.distribution('auth.signin_time', authTime);

      // Log successful login attempt
      logger.info(LOG_CATEGORY, 'User signed in successfully', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        authTime
      });

      // Mise à jour des tentatives de connexion
      await this.updateLoginAttempts(userCredential.user.uid, true);

      return userCredential.user;
    } catch (error) {
      // Mise à jour des tentatives de connexion en cas d'échec
      if (error instanceof FirebaseError) {
        await this.updateLoginAttempts(error.code === 'auth/user-not-found' ? 'unknown' : email, false);
      }

      if (error instanceof FirebaseError) {
        throw ErrorService.handleFirebaseAuthError(error);
      }
      throw ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Une erreur inattendue est survenue lors de la connexion',
        error
      );
    }
  }

  private async updateLoginAttempts(identifier: string, success: boolean): Promise<void> {
    try {
      const attemptsRef = doc(collection(firestore, 'userAttempts'), identifier);
      const now = serverTimestamp();
      
      if (success) {
        // Réinitialiser les tentatives en cas de succès
        await setDoc(attemptsRef, {
          attempts: 0,
          lastAttempt: now,
          lastSuccess: now
        }, { merge: true });
      } else {
        // Incrémenter les tentatives en cas d'échec
        await setDoc(attemptsRef, {
          attempts: increment(1),
          lastAttempt: now,
          lastFailure: now
        }, { merge: true });
      }
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error updating login attempts', error);
      Sentry.captureException(error);
    }
  }

  public async createUserWithEmail(email: string, password: string): Promise<User> {
    const startTime = Date.now();
    try {
      const userCredential = await this.retryOperation(() =>
        createUserWithEmailAndPassword(this.auth, email, password)
      );

      // Envoyer l'email de vérification
      await sendEmailVerification(userCredential.user);

      // Créer le profil utilisateur dans Firestore
      await setDoc(doc(collection(firestore, 'users'), userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: false,
        attempts: 0
      });

      // Métriques de performance
      const registrationTime = Date.now() - startTime;
      Sentry.metrics.distribution('auth.registration_time', registrationTime);

      logger.info(LOG_CATEGORY, 'User created successfully', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        registrationTime
      });

      return userCredential.user;
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw ErrorService.handleFirebaseAuthError(error);
      }
      throw ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Une erreur inattendue est survenue lors de la création du compte',
        error
      );
    }
  }

  public async signOut(): Promise<void> {
    try {
      await this.retryOperation(() => signOut(this.auth));
      if (this.tokenRefreshTimer) {
        clearInterval(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
      this.tokenEncryption.clearStoredToken();
      logger.info(LOG_CATEGORY, 'User signed out successfully');
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error during sign out', error);
      Sentry.captureException(error);
      throw ErrorService.createAuthError(
        AuthErrorCode.SIGN_OUT_ERROR,
        'Une erreur est survenue lors de la déconnexion',
        error
      );
    }
  }

  public async resendVerificationEmail(user: User): Promise<void> {
    try {
      await this.retryOperation(() => sendEmailVerification(user));
      logger.info(LOG_CATEGORY, 'Verification email sent', { uid: user.uid });
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Error sending verification email', error);
      Sentry.captureException(error);
      throw ErrorService.createAuthError(
        AuthErrorCode.EMAIL_VERIFICATION_ERROR,
        'Erreur lors de l\'envoi de l\'email de vérification',
        error
      );
    }
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getFirestore(): Firestore {
    return this.firestore;
  }

  public getFunctions(): Functions {
    return this.functions;
  }
}
