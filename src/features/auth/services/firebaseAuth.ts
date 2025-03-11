import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { firebaseAuth as coreFirebaseAuth } from '@/lib/firebase/auth';
import { logger } from '@/core/logger';

const LOG_CATEGORY = 'FirebaseAuth';

class FirebaseAuth {
  private static instance: FirebaseAuth;
  private auth: Auth | null = null;

  private constructor() {
    // L'auth est désormais initialisé et géré par le service central
    // On utilise la propriété auth du service Firebase Auth
    this.auth = coreFirebaseAuth['auth'];
    
    logger.info({
      category: LOG_CATEGORY,
      message: 'Service FirebaseAuth initialisé avec succès',
      data: { providerSource: 'coreFirebaseAuth' }
    });
  }

  public static getInstance(): FirebaseAuth {
    if (!FirebaseAuth.instance) {
      FirebaseAuth.instance = new FirebaseAuth();
    }
    return FirebaseAuth.instance;
  }

  private async ensureAuth(): Promise<Auth> {
    if (!this.auth) {
      throw new Error('Firebase Auth n\'a pas pu être initialisé');
    }
    
    return this.auth;
  }

  async signInWithEmailPassword(email: string, password: string): Promise<User> {
    try {
      const auth = await this.ensureAuth();
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Tentative de connexion avec email/mot de passe',
        data: { emailProvided: !!email }
      });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Connexion réussie avec email/mot de passe',
        data: { userId: userCredential.user.uid }
      });
      
      return userCredential.user;
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec de connexion avec email/mot de passe',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  async createAccount(email: string, password: string): Promise<User> {
    try {
      const auth = await this.ensureAuth();
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Tentative de création de compte',
        data: { emailProvided: !!email }
      });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Création de compte réussie',
        data: { userId: userCredential.user.uid }
      });
      
      return userCredential.user;
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec de création de compte',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const auth = await this.ensureAuth();
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Tentative d\'envoi d\'email de réinitialisation de mot de passe',
        data: { emailProvided: !!email }
      });
      
      await sendPasswordResetEmail(auth, email);
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Email de réinitialisation de mot de passe envoyé avec succès',
        data: { emailProvided: !!email }
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec d\'envoi d\'email de réinitialisation de mot de passe',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  async sendVerificationEmail(user: User): Promise<void> {
    try {
      logger.info({
        category: LOG_CATEGORY,
        message: 'Tentative d\'envoi d\'email de vérification',
        data: { userId: user.uid }
      });
      
      await sendEmailVerification(user);
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Email de vérification envoyé avec succès',
        data: { userId: user.uid }
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec d\'envoi d\'email de vérification',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  async updateUserProfile(user: User, displayName: string, photoURL?: string): Promise<void> {
    try {
      logger.info({
        category: LOG_CATEGORY,
        message: 'Mise à jour du profil utilisateur',
        data: { userId: user.uid, hasDisplayName: !!displayName, hasPhotoUrl: !!photoURL }
      });
      
      await updateProfile(user, { displayName, photoURL: photoURL || null });
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Profil utilisateur mis à jour avec succès',
        data: { userId: user.uid }
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec de mise à jour du profil utilisateur',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const auth = await this.ensureAuth();
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Tentative de déconnexion'
      });
      
      await signOut(auth);
      
      logger.info({
        category: LOG_CATEGORY,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      logger.error({
        category: LOG_CATEGORY,
        message: 'Échec de déconnexion',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }
}

export const firebaseAuth = FirebaseAuth.getInstance();
