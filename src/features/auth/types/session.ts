import { User } from 'firebase/auth';

export type SessionStatus = 'active' | 'expired' | 'invalid' | 'refreshing';

export interface SessionState {
  status: SessionStatus;
  lastChecked: number;
  expiresAt: number;
  user: User | null;
}

export interface SessionConfig {
  checkInterval: number;  // Intervalle de vérification en ms
  tokenRefreshThreshold: number;  // Seuil de rafraîchissement en ms
  maxRetries: number;
  retryDelay: number;  // Délai entre les tentatives en ms
}

export interface SessionEvent {
  type: 'expired' | 'refreshed' | 'invalid' | 'error';
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface SessionManager {
  startSession(user: User): Promise<void>;
  checkSession(): Promise<boolean>;
  refreshToken(): Promise<void>;
  endSession(): Promise<void>;
  getSessionState(): SessionState;
  onSessionEvent(callback: (event: SessionEvent) => void): () => void;
}
