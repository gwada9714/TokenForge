import { FirebaseError } from "firebase/app";
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  sendEmailVerification,
  getIdToken,
  onIdTokenChanged,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { firestoreService } from "@/lib/firebase/firestore";
import { AuthErrorCode } from "../errors/AuthError";
import { ErrorService } from "./errorService";
import { logger } from "../../../core/logger";
import { TokenEncryption } from "../../../utils/token-encryption";
import * as Sentry from "@sentry/react";
import { getFirebaseManager } from "@/lib/firebase/services";

const LOG_CATEGORY = "FirebaseService";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * @deprecated Ce service est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser firebaseAuth depuis @/lib/firebase/auth et firestoreService depuis @/lib/firebase/firestore
 */
export class FirebaseService {
  private static instance: FirebaseService | null = null;
  private _auth: Auth | null = null;
  private _db: any | null = null;
  private _functions: any | null = null;
  private tokenEncryption: TokenEncryption;
  private _initialized = false;

  private constructor() {
    this.tokenEncryption = TokenEncryption.getInstance();
    logger.info(`${LOG_CATEGORY}: Initializing FirebaseService`);
  }

  public static async getInstance(): Promise<FirebaseService> {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
      // Ne pas initialiser automatiquement - déprécié
      logger.warn(
        `${LOG_CATEGORY}: Ce service est déprécié. Utilisez firebaseAuth depuis @/lib/firebase/auth`
      );
    }
    return FirebaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    try {
      logger.debug(
        `${LOG_CATEGORY}: 🔄 Initialisation des services Firebase (déprécié)`
      );

      // Vérifier si les services sont déjà disponibles
      try {
        // Essayer d'obtenir les services déjà initialisés
        this._auth = await getFirebaseAuth();
        const fbManager = await getFirebaseManager();
        this._db = fbManager.db;
        this._functions = fbManager.functions;
        this._initialized = true;
        this.setupTokenRefresh();
        logger.info(
          `${LOG_CATEGORY}: ✅ Services Firebase initialisés (déprécié)`
        );
      } catch (error) {
        // Si les services ne sont pas encore disponibles, signaler mais ne pas bloquer
        logger.warn({
          message: `${LOG_CATEGORY}: Service déprécié - certains services Firebase ne sont pas encore disponibles`,
          error,
        });
        // Ne pas propager l'erreur - le service est déprécié
      }
    } catch (error) {
      logger.warn({
        message: `${LOG_CATEGORY}: ⚠️ Initialisation différée (déprécié)`,
        error,
      });
      // Ne pas propager l'erreur - le service est déprécié
    }
  }

  private setupTokenRefresh(): void {
    if (!this._auth) {
      logger.error(`${LOG_CATEGORY}: Auth service not initialized`);
      return;
    }

    onIdTokenChanged(this._auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user, true);
          await this.tokenEncryption.encryptAndStoreToken(token);
          await this.updateSessionToken(token);
          await this.updateUserLastActivity(user.uid);
        } catch (error) {
          logger.error({
            message: `${LOG_CATEGORY}: Error refreshing token`,
            error,
          });
          Sentry.captureException(error);
        }
      } else {
        this.tokenEncryption.clearStoredToken();
      }
    });
  }

  private async updateSessionToken(token: string): Promise<void> {
    try {
      if (!this._functions) {
        throw new Error("Functions not initialized");
      }

      const updateSession = httpsCallable(
        this._functions,
        "updateSessionToken"
      );
      await updateSession({ token });
    } catch (error) {
      logger.error({
        message: `${LOG_CATEGORY}: Error updating session token`,
        error,
      });
      Sentry.captureException(error);
    }
  }

  private async updateUserLastActivity(userId: string): Promise<void> {
    try {
      // Utiliser la bonne API de Firestore
      await firestoreService.setDocument("users", userId, {
        lastActivity: new Date(),
        lastTokenRefresh: new Date(),
      });
    } catch (error) {
      logger.error({
        message: `${LOG_CATEGORY}: Error updating user activity`,
        error,
      });
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempts: number = MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;
        const delay = RETRY_DELAY * Math.pow(2, i); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        logger.warn({
          message: `${LOG_CATEGORY}: Retry attempt ${i + 1}/${attempts}`,
          error,
        });
      }
    }
    throw new Error("Max retry attempts reached");
  }

  public async signInWithEmail(email: string, password: string): Promise<User> {
    if (!this._auth) {
      throw new Error("Auth service not initialized");
    }

    const startTime = Date.now();
    try {
      const userCredential = await this.retryOperation(() =>
        signInWithEmailAndPassword(this._auth!, email, password)
      );

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        throw ErrorService.createAuthError(
          AuthErrorCode.INVALID_EMAIL,
          "Veuillez vérifier votre email avant de vous connecter"
        );
      }

      // Log successful login attempt
      logger.info({
        message: `${LOG_CATEGORY}: User signed in successfully`,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        authTime: Date.now() - startTime,
      });

      // Mise à jour des tentatives de connexion
      await this.updateLoginAttempts(userCredential.user.uid, true);

      return userCredential.user;
    } catch (error) {
      // Mise à jour des tentatives de connexion en cas d'échec
      if (error instanceof FirebaseError) {
        await this.updateLoginAttempts(
          error.code === "auth/user-not-found" ? "unknown" : email,
          false
        );
      }

      if (error instanceof FirebaseError) {
        throw ErrorService.handleFirebaseAuthError(error);
      }
      throw ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Une erreur inattendue est survenue lors de la connexion"
      );
    }
  }

  private async updateLoginAttempts(
    identifier: string,
    success: boolean
  ): Promise<void> {
    try {
      const now = new Date();

      if (success) {
        // Réinitialiser les tentatives en cas de succès
        await firestoreService.setDocument("userAttempts", identifier, {
          attempts: 0,
          lastAttempt: now,
          lastSuccess: now,
        });
      } else {
        // Récupérer d'abord les données actuelles
        const currentData = (await firestoreService.getDocument(
          "userAttempts",
          identifier
        )) || { attempts: 0 };

        await firestoreService.setDocument("userAttempts", identifier, {
          attempts: (currentData.attempts || 0) + 1,
          lastAttempt: now,
          lastFailure: now,
        });
      }
    } catch (error) {
      logger.error({
        message: `${LOG_CATEGORY}: Error updating login attempts`,
        error,
      });
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  public async createUserWithEmail(
    email: string,
    password: string
  ): Promise<User> {
    if (!this._auth) {
      throw new Error("Auth service not initialized");
    }

    const startTime = Date.now();
    try {
      const userCredential = await this.retryOperation(() =>
        createUserWithEmailAndPassword(this._auth!, email, password)
      );

      // Envoyer l'email de vérification
      await sendEmailVerification(userCredential.user);

      // Créer le profil utilisateur dans Firestore
      await firestoreService.setDocument("users", userCredential.user.uid, {
        email: userCredential.user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        emailVerified: false,
        attempts: 0,
      });

      // Log successful account creation
      logger.info({
        message: `${LOG_CATEGORY}: User account created successfully`,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        creationTime: Date.now() - startTime,
      });

      return userCredential.user;
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw ErrorService.handleFirebaseAuthError(error);
      }
      throw ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Une erreur inattendue est survenue lors de la création du compte"
      );
    }
  }

  public async signOut(): Promise<void> {
    if (!this._auth) {
      throw new Error("Auth service not initialized");
    }

    try {
      logger.info(`${LOG_CATEGORY}: Signing out user`);

      await signOut(this._auth);

      logger.info(`${LOG_CATEGORY}: User signed out successfully`);
    } catch (error) {
      logger.error({
        message: `${LOG_CATEGORY}: Error signing out user`,
        error,
      });

      throw ErrorService.createAuthError(
        AuthErrorCode.SIGNOUT_ERROR,
        "Une erreur est survenue lors de la déconnexion"
      );
    }
  }

  public async sendVerificationEmail(user: User): Promise<void> {
    try {
      logger.info({
        message: `${LOG_CATEGORY}: Sending verification email`,
        uid: user.uid,
        email: user.email,
      });

      await sendEmailVerification(user);

      logger.info({
        message: `${LOG_CATEGORY}: Verification email sent successfully`,
        uid: user.uid,
      });
    } catch (error) {
      logger.error({
        message: `${LOG_CATEGORY}: Error sending verification email`,
        error,
      });

      throw ErrorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "Une erreur est survenue lors de l'envoi de l'email de vérification"
      );
    }
  }

  get auth(): Auth {
    if (!this._auth) {
      throw new Error("Auth service not initialized");
    }
    return this._auth;
  }

  get db(): any {
    if (!this._db) {
      throw new Error("Firestore service not initialized");
    }
    return this._db;
  }

  get functions(): any {
    if (!this._functions) {
      throw new Error("Functions service not initialized");
    }
    return this._functions;
  }
}

export const firebaseService = FirebaseService.getInstance();
