import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  UserCredential,
  Auth,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { logger } from '@/utils/firebase-logger';

const LOG_CATEGORY = 'FirebaseAuth';

class FirebaseAuth {
  private static instance: FirebaseAuth;
  private readonly auth: Auth;

  private constructor() {
    this.auth = auth;
    logger.info({ message: 'Service FirebaseAuth initialisé' });
  }

  public static getInstance(): FirebaseAuth {
    if (!FirebaseAuth.instance) {
      FirebaseAuth.instance = new FirebaseAuth();
    }
    return FirebaseAuth.instance;
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      logger.debug({ message: 'Tentative de connexion', email });
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      logger.info({ message: 'Connexion réussie', email });
      return result;
    } catch (error) {
      logger.error({ message: 'Échec de la connexion', error, email });
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      logger.debug({ message: 'Tentative d\'inscription', email });
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      logger.info({ message: 'Inscription réussie', email });
      return result;
    } catch (error) {
      logger.error({ message: 'Échec de l\'inscription', error, email });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      logger.debug({ message: 'Tentative de déconnexion' });
      await signOut(this.auth);
      logger.info({ message: 'Déconnexion réussie' });
    } catch (error) {
      logger.error({ message: 'Échec de la déconnexion', error });
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  async waitForAuthInit(): Promise<void> {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, () => {
        unsubscribe();
        resolve();
      });
    });
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      logger.debug({ message: 'Envoi de réinitialisation de mot de passe', email });
      await sendPasswordResetEmail(this.auth, email);
      logger.info({ message: 'Email de réinitialisation envoyé', email });
    } catch (error) {
      logger.error({ message: 'Échec de l\'envoi de réinitialisation', error, email });
      throw error;
    }
  }

  async sendVerificationEmail(user: User): Promise<void> {
    try {
      logger.debug({ message: 'Envoi d\'email de vérification', email: user.email });
      await sendEmailVerification(user);
      logger.info({ message: 'Email de vérification envoyé', email: user.email });
    } catch (error) {
      logger.error({ message: 'Échec de l\'envoi de vérification', error, email: user.email });
      throw error;
    }
  }

  async updateUserProfile(user: User, displayName?: string, photoURL?: string): Promise<void> {
    try {
      logger.debug({ message: 'Mise à jour du profil', uid: user.uid });
      await updateProfile(user, { displayName, photoURL });
      logger.info({ message: 'Profil mis à jour', uid: user.uid });
    } catch (error) {
      logger.error({ message: 'Échec de la mise à jour du profil', error, uid: user.uid });
      throw error;
    }
  }

  getAuth(): Auth {
    return this.auth;
  }
}

export const firebaseAuth = FirebaseAuth.getInstance();
