import { getAuth, signInAnonymously, User, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../config/firebase';
import { logger } from '../../core/logger';

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private auth = getAuth(app);
  private currentUser: User | null = null;

  private constructor() {
    // Écouter les changements d'état d'authentification
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      
      if (user) {
        logger.info({
          category: 'FirebaseAuth',
          message: 'Utilisateur authentifié',
          data: { 
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            emailVerified: user.emailVerified 
          }
        });
      } else {
        logger.info({
          category: 'FirebaseAuth',
          message: 'Utilisateur déconnecté'
        });
      }
    });
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  // Récupérer l'utilisateur actuel
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Authentification anonyme
  public async signInAnonymously(): Promise<User> {
    try {
      logger.info({
        category: 'FirebaseAuth',
        message: 'Tentative de connexion anonyme'
      });
      
      const result = await signInAnonymously(this.auth);
      
      logger.info({
        category: 'FirebaseAuth',
        message: 'Connexion anonyme réussie',
        data: { uid: result.user.uid }
      });
      
      return result.user;
    } catch (error) {
      logger.error({
        category: 'FirebaseAuth',
        message: 'Erreur de connexion anonyme',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }

  // Déconnexion
  public async signOut(): Promise<void> {
    try {
      logger.info({
        category: 'FirebaseAuth',
        message: 'Tentative de déconnexion'
      });
      
      await this.auth.signOut();
      
      logger.info({
        category: 'FirebaseAuth',
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      logger.error({
        category: 'FirebaseAuth',
        message: 'Erreur lors de la déconnexion',
        error: error instanceof Error ? error : new Error(String(error))
      });
      
      throw error;
    }
  }
}

export const firebaseAuth = FirebaseAuthService.getInstance();
