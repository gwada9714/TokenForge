import { User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { logger } from '@/utils/firebase-logger';

const LOG_CATEGORY = 'SessionService';

export class SessionService {
  private static instance: SessionService;
  private currentUser: User | null = null;
  private authInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      logger.debug(LOG_CATEGORY, { message: ' Initialisation du service de session' });
      const auth = await getFirebaseAuth();
      
      // Écouter les changements d'état d'authentification
      auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.authInitialized = true;
        
        if (user) {
          logger.info(LOG_CATEGORY, { 
            message: 'Utilisateur connecté',
            userId: user.uid,
            email: user.email 
          });
        } else {
          logger.info(LOG_CATEGORY, { message: 'Aucun utilisateur connecté' });
        }
      });

      logger.info(LOG_CATEGORY, { message: 'Service de session initialisé' });
    } catch (error) {
      logger.error(LOG_CATEGORY, { message: 'Erreur lors de l\'initialisation du service de session', error });
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  public isAuthInitialized(): boolean {
    return this.authInitialized;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async startSession(): Promise<void> {
    if (!this.authInitialized) {
      await this.initialize();
    }
  }

  public async logout(): Promise<void> {
    const auth = await getFirebaseAuth();
    await auth.signOut();
  }

  public isSessionActive(): boolean {
    return this.isAuthenticated();
  }

  public getSessionInfo(): { lastActivity: Date; expiresAt: Date } {
    // TODO: Implementer la logique pour récupérer les informations de session
    throw new Error('Method not implemented.');
  }
}

// Export une instance unique
export const sessionService = SessionService.getInstance();
