import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  User,
  UserCredential,
  Auth
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { logger } from '@/utils/firebase-logger';

const LOG_CATEGORY = 'FirebaseAuth';

export class FirebaseAuth {
  private static instance: FirebaseAuth;
  private _auth: Auth | null = null;

  private constructor() {}

  public static getInstance(): FirebaseAuth {
    if (!FirebaseAuth.instance) {
      FirebaseAuth.instance = new FirebaseAuth();
    }
    return FirebaseAuth.instance;
  }

  public async initialize(): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔄 Initialisation de Firebase Auth' });
      this._auth = await getFirebaseAuth();
      logger.info(LOG_CATEGORY, { message: '✅ Firebase Auth initialisé' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'initialisation de Firebase Auth', error });
      throw error;
    }
  }

  private get auth(): Auth {
    if (!this._auth) {
      throw new Error('Firebase Auth n\'est pas encore initialisé');
    }
    return this._auth;
  }

  public async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔐 Tentative de connexion', email });
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      logger.info(LOG_CATEGORY, { message: '✅ Connexion réussie', email });
      return result;
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la connexion', email, error });
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🚪 Déconnexion' });
      await signOut(this.auth);
      logger.info(LOG_CATEGORY, { message: '✅ Déconnexion réussie' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la déconnexion', error });
      throw error;
    }
  }

  public async createUser(email: string, password: string): Promise<UserCredential> {
    try {
      logger.debug(LOG_CATEGORY, { message: '👤 Création d\'un nouvel utilisateur', email });
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      logger.info(LOG_CATEGORY, { message: '✅ Utilisateur créé avec succès', email });
      return result;
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la création de l\'utilisateur', email, error });
      throw error;
    }
  }

  public async sendVerificationEmail(user: User): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '📧 Envoi de l\'email de vérification', email: user.email });
      await sendEmailVerification(user);
      logger.info(LOG_CATEGORY, { message: '✅ Email de vérification envoyé', email: user.email });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de l\'envoi de l\'email de vérification', email: user.email, error });
      throw error;
    }
  }

  public async resetPassword(email: string): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔑 Demande de réinitialisation du mot de passe', email });
      await sendPasswordResetEmail(this.auth, email);
      logger.info(LOG_CATEGORY, { message: '✅ Email de réinitialisation envoyé', email });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la demande de réinitialisation', email, error });
      throw error;
    }
  }

  public async updateUserProfile(user: User, displayName: string): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '📝 Mise à jour du profil utilisateur', email: user.email });
      await updateProfile(user, { displayName });
      logger.info(LOG_CATEGORY, { message: '✅ Profil utilisateur mis à jour', email: user.email });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la mise à jour du profil', email: user.email, error });
      throw error;
    }
  }

  public async updateUserPassword(user: User, newPassword: string): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: '🔒 Mise à jour du mot de passe', email: user.email });
      await updatePassword(user, newPassword);
      logger.info(LOG_CATEGORY, { message: '✅ Mot de passe mis à jour', email: user.email });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: '❌ Erreur lors de la mise à jour du mot de passe', email: user.email, error });
      throw error;
    }
  }
}

// Export une instance unique
export const firebaseAuth = FirebaseAuth.getInstance();
