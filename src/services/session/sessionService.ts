import { Auth, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { logger } from '@/utils/logger';
import { LogEntry } from '@/types/logger';

export enum SessionState {
  INITIALIZING = 'INITIALIZING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ERROR = 'ERROR'
}

interface SessionLogEntry extends LogEntry {
  userId?: string;
}

export class SessionService {
  private static instance: SessionService;
  private currentState: SessionState = SessionState.INITIALIZING;
  private auth: Auth;

  private constructor() {
    this.auth = auth;
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public getCurrentState(): SessionState {
    return this.currentState;
  }

  async startSession(): Promise<void> {
    try {
      this.currentState = SessionState.INITIALIZING;
      const user: User | null = this.auth.currentUser;

      if (!user) {
        this.currentState = SessionState.UNAUTHENTICATED;
        logger.info({
          message: 'Session non authentifiée',
          category: 'Session'
        } as SessionLogEntry);
        return;
      }

      this.currentState = SessionState.AUTHENTICATED;
      logger.info({
        message: 'Session démarrée avec succès',
        category: 'Session',
        userId: user.uid
      } as SessionLogEntry);
    } catch (error) {
      this.currentState = SessionState.ERROR;
      logger.error({
        message: 'Erreur lors du démarrage de la session',
        category: 'Session',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  async endSession(): Promise<void> {
    try {
      await this.auth.signOut();
      this.currentState = SessionState.UNAUTHENTICATED;
      logger.info({
        message: 'Session terminée avec succès',
        category: 'Session'
      } as SessionLogEntry);
    } catch (error) {
      logger.error({
        message: 'Erreur lors de la terminaison de la session',
        category: 'Session',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }
} 