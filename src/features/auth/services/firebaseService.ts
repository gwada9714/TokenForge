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
import { httpsCallable } from "firebase/functions";
import { getFirebaseManager, firestoreService } from "@/lib/firebase";
import { AuthErrorCode } from "../errors/AuthError";
import { ErrorService } from "./errorService";
import { logger } from '../../../utils/firebase-logger';
import { TokenEncryption } from '../../../utils/token-encryption';
import * as Sentry from '@sentry/react';

const LOG_CATEGORY = 'FirebaseService';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export class FirebaseService {
  private static instance: FirebaseService | null = null;
  private _auth: Auth | null = null;
  private _db: any | null = null;
  private _functions: any | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;
  private tokenEncryption: TokenEncryption;

  private constructor() {
    this.tokenEncryption = TokenEncryption.getInstance();
  }

  public static async getInstance(): Promise<FirebaseService> {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
      await FirebaseService.instance.initialize();
      logger.info(LOG_CATEGORY, 'FirebaseService initialized successfully');
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔄 Initialisation des services Firebase' });
      const firebaseManager = await getFirebaseManager();
      this._auth = firebaseManager.auth;
      this._db = firebaseManager.db;
      this._functions = firebaseManager.functions;
      this.setupTokenRefresh();
      logger.info(LOG_CATEGORY, { message: '✅ Services Firebase initialisés' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'initialisation des services Firebase', error });
      throw error;
    }
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
      const userRef = this.firestoreService.doc('users', userId);
      await this.firestoreService.updateDoc(userRef, {
        lastActivity: this.firestoreService.serverTimestamp(),
        lastTokenRefresh: this.firestoreService.serverTimestamp()
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
      const attemptsRef = this.firestoreService.doc('userAttempts', identifier);
      const now = this.firestoreService.serverTimestamp();
      
      if (success) {
        // Réinitialiser les tentatives en cas de succès
        await this.firestoreService.setDoc(attemptsRef, {
          attempts: 0,
          lastAttempt: now,
          lastSuccess: now
        }, { merge: true });
      } else {
        // Incrémenter les tentatives en cas d'échec
        await this.firestoreService.setDoc(attemptsRef, {
          attempts: this.firestoreService.increment(1),
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
      await this.firestoreService.setDoc(this.firestoreService.doc('users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: this.firestoreService.serverTimestamp(),
        lastLogin: this.firestoreService.serverTimestamp(),
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

  get auth(): Auth {
    if (!this._auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé');
    }
    return this._auth;
  }

  get db(): any {
    if (!this._db) {
      throw new Error('Firebase Firestore n\'est pas encore initialisé');
    }
    return this._db;
  }

  get functions(): any {
    if (!this._functions) {
      throw new Error('Firebase Functions n\'est pas encore initialisé');
    }
    return this._functions;
  }
}

export const firebaseService = FirebaseService.getInstance();
