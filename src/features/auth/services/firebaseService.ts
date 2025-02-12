import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  AuthErrorCodes, 
  updateProfile,
  Auth,
  User,
  UserCredential
} from "firebase/auth";
import { FirebaseError } from 'firebase/app';
import { getFirebaseServices } from "../../../config/firebase";
import { errorService } from "./errorService";
import { logService } from "./logService";
import { AuthErrorCode } from '../errors/AuthError';
import { TokenForgeUser } from '../types';

const LOG_CATEGORY = 'FirebaseService';
const AUTH_ERROR_CODES = AuthErrorCodes;

class FirebaseService {
  private auth: Auth;

  constructor() {
    const { auth } = getFirebaseServices();
    if (!auth) throw errorService.createAuthError(AuthErrorCode.INVALID_OPERATION, 'Firebase Auth not initialized');
    this.auth = auth;
  }

  private convertToTokenForgeUser(userCredential: UserCredential | { user: User }): TokenForgeUser {
    const { user } = userCredential;
    if (!user) {
      throw errorService.createAuthError(AuthErrorCode.INVALID_OPERATION, 'User not found in credentials');
    }

    // Étendre l'objet User avec les propriétés spécifiques de TokenForgeUser
    return Object.assign(Object.create(Object.getPrototypeOf(user)), {
      ...user,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: true,
      metadata: {
        creationTime: user.metadata.creationTime || '',
        lastSignInTime: user.metadata.lastSignInTime || ''
      }
    }) as TokenForgeUser;
  }

  private formatFirebaseError(error: FirebaseError): Record<string, unknown> {
    return {
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  async signInWithEmail(email: string, password: string): Promise<TokenForgeUser> {
    try {
      logService.info(LOG_CATEGORY, 'Tentative de connexion par email', { email });
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return this.convertToTokenForgeUser(userCredential);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      logService.error(LOG_CATEGORY, 'Erreur lors de la connexion par email', this.formatFirebaseError(firebaseError));

      if (firebaseError.code === AUTH_ERROR_CODES.INVALID_EMAIL) {
        throw errorService.createAuthError(
          AuthErrorCode.INVALID_EMAIL,
          firebaseError.message
        );
      }

      if (firebaseError.code === AUTH_ERROR_CODES.USER_DISABLED) {
        throw errorService.createAuthError(
          AuthErrorCode.USER_DISABLED,
          firebaseError.message
        );
      }

      if (firebaseError.code === AUTH_ERROR_CODES.INVALID_PASSWORD) {
        throw errorService.createAuthError(
          AuthErrorCode.WRONG_PASSWORD,
          firebaseError.message
        );
      }

      throw errorService.createAuthError(AuthErrorCode.SIGN_IN_ERROR, firebaseError.message);
    }
  }

  async createUser(email: string, password: string): Promise<TokenForgeUser> {
    try {
      logService.info(LOG_CATEGORY, 'Tentative de création de compte', { email });
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return this.convertToTokenForgeUser(userCredential);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      logService.error(LOG_CATEGORY, 'Erreur lors de la création du compte', this.formatFirebaseError(firebaseError));

      if (firebaseError.code === AUTH_ERROR_CODES.EMAIL_EXISTS) {
        throw errorService.createAuthError(
          AuthErrorCode.EMAIL_ALREADY_IN_USE,
          firebaseError.message
        );
      }

      throw errorService.createAuthError(AuthErrorCode.CREATE_USER_ERROR, firebaseError.message);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      logService.info(LOG_CATEGORY, 'Demande de réinitialisation du mot de passe', { email });
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      logService.error(LOG_CATEGORY, 'Erreur lors de la réinitialisation du mot de passe', this.formatFirebaseError(firebaseError));

      if (firebaseError.code === AUTH_ERROR_CODES.INVALID_EMAIL) {
        throw errorService.createAuthError(
          AuthErrorCode.INVALID_EMAIL,
          firebaseError.message
        );
      }

      throw errorService.createAuthError(AuthErrorCode.RESET_PASSWORD_ERROR, firebaseError.message);
    }
  }

  async updateUserProfile(displayName: string): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw errorService.createAuthError(AuthErrorCode.INVALID_OPERATION, 'No user is currently signed in');
      }

      logService.info(LOG_CATEGORY, 'Mise à jour du profil utilisateur', { 
        userId: currentUser.uid,
        displayName 
      });

      await updateProfile(currentUser, { displayName });
    } catch (error) {
      const firebaseError = error as FirebaseError;
      logService.error(LOG_CATEGORY, 'Erreur lors de la mise à jour du profil', {
        ...this.formatFirebaseError(firebaseError),
        userId: this.auth.currentUser?.uid
      });

      throw errorService.createAuthError(AuthErrorCode.UPDATE_PROFILE_ERROR, firebaseError.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      logService.error(LOG_CATEGORY, 'Erreur lors de la déconnexion', this.formatFirebaseError(firebaseError));
      throw errorService.createAuthError(AuthErrorCode.SIGN_OUT_ERROR, firebaseError.message);
    }
  }
}

export const firebaseService = new FirebaseService();
