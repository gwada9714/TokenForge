import { User } from "firebase/auth";
import { logger } from "@/core/logger/BaseLogger";
import { firebaseManager } from "@/services/firebase/services";
import {
  SessionState,
  SessionStatus,
  SessionEventListener,
  SessionEventPayload,
} from "@/types/session";
import { ServiceError } from "@/types/firebase-errors";

export enum SessionStatus {
  INITIALIZING = "INITIALIZING",
  AUTHENTICATED = "AUTHENTICATED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  ERROR = "ERROR",
}

export interface SessionState {
  status: SessionStatus;
  user: User | null;
  error?: Error;
  lastUpdated?: number;
}

export class SessionService {
  private static instance: SessionService;
  private currentState: SessionState;
  private listeners: Set<SessionEventListener> = new Set();
  private unsubscribeAuth?: () => void;

  private constructor() {
    this.currentState = {
      status: SessionStatus.INITIALIZING,
      user: null,
      lastUpdated: Date.now(),
    };
    this.initAuthListener().catch((error) => this.handleError(error));
  }

  public subscribe(listener: SessionEventListener): () => void {
    this.listeners.add(listener);
    // Envoyer l'état actuel immédiatement
    listener({ type: "SESSION_CHANGED", state: this.currentState });

    return () => this.listeners.delete(listener);
  }

  private notifyListeners(payload: SessionEventPayload): void {
    this.listeners.forEach((listener) => listener(payload));
  }

  private async initAuthListener(): Promise<void> {
    const auth = await firebaseManager.getAuth();

    // Nettoyage de l'ancien listener si existe
    this.unsubscribeAuth?.();

    this.unsubscribeAuth = auth.onAuthStateChanged(
      (user: User | null) => this.updateSessionState(user),
      (error) => this.handleError(error)
    );
  }

  public cleanup(): void {
    this.unsubscribeAuth?.();
    this.listeners.clear();
  }

  private updateSessionState(user: User | null): void {
    this.currentState = {
      status: user
        ? SessionStatus.AUTHENTICATED
        : SessionStatus.UNAUTHENTICATED,
      user,
      lastUpdated: Date.now(),
    };

    this.notifyListeners({
      type: "SESSION_CHANGED",
      state: this.currentState,
    });

    logger.info({
      category: "SessionService",
      message: "Session state updated",
      metadata: {
        status: this.currentState.status,
        userId: user?.uid,
        lastUpdated: this.currentState.lastUpdated,
      },
    });
  }

  private handleError(error: unknown): void {
    const serviceError = new ServiceError(
      "Session service error",
      "SessionService",
      error instanceof Error ? error : new Error(String(error))
    );

    this.currentState = {
      status: SessionStatus.ERROR,
      user: null,
      error: serviceError,
      lastUpdated: Date.now(),
    };

    this.notifyListeners({
      type: "SESSION_ERROR",
      state: this.currentState,
    });

    logger.error({
      category: "SessionService",
      message: serviceError.message,
      error: serviceError,
      metadata: {
        status: this.currentState.status,
        lastUpdated: this.currentState.lastUpdated,
        service: "SessionService",
      },
    });
  }

  public getSessionState(): SessionState {
    return this.currentState;
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }
}

export { SessionState, SessionStatus, ServiceError };
export const sessionService = SessionService.getInstance();
