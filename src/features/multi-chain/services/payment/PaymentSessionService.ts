import { v4 as uuidv4 } from 'uuid';
import { PaymentSession, PaymentStatus, PaymentToken } from './types/PaymentSession';
import { PaymentSyncService, IPaymentSessionManager } from './PaymentSyncService';

export class PaymentSessionService implements IPaymentSessionManager {
  private static instance: PaymentSessionService;
  private sessions: Map<string, PaymentSession>;
  private timeouts: Map<string, NodeJS.Timeout>;
  private syncService: PaymentSyncService;
  private readonly RETRY_LIMIT = 3;
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  private constructor() {
    this.sessions = new Map();
    this.timeouts = new Map();
    this.syncService = PaymentSyncService.getInstance(this);
  }

  public static getInstance(): PaymentSessionService {
    if (!PaymentSessionService.instance) {
      PaymentSessionService.instance = new PaymentSessionService();
    }
    return PaymentSessionService.instance;
  }

  public createSession(
    userId: string,
    amount: bigint,
    token: PaymentToken,
    serviceType: PaymentSession['serviceType']
  ): PaymentSession {
    const now = new Date();
    const session: PaymentSession = {
      id: uuidv4(),
      userId,
      amount,
      token,
      network: token.network,
      serviceType,
      status: PaymentStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + this.TIMEOUT_MS),
      retryCount: 0
    };

    this.sessions.set(session.id, session);
    this.setupSessionTimeout(session.id);
    this.syncService.broadcastSessionUpdate(session.id, session);

    return session;
  }

  public getSession(sessionId: string): PaymentSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getSessions(): Map<string, PaymentSession> {
    return this.sessions;
  }

  public updateSession(sessionId: string, updates: Partial<PaymentSession>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, updatedSession);
    this.syncService.broadcastSessionUpdate(sessionId, updates);

    // Si le statut est final, nettoyer le timeout
    if (updates.status && updates.status !== PaymentStatus.PENDING) {
      this.cleanupTimeout(sessionId);
    }
  }

  public updateSessionStatus(
    sessionId: string,
    status: PaymentStatus,
    txHash?: string,
    error?: string
  ): PaymentSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    this.updateSession(sessionId, { status, txHash, error });
    return this.sessions.get(sessionId)!;
  }

  public async retryPayment(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.retryCount >= this.RETRY_LIMIT) {
      this.updateSession(sessionId, {
        status: PaymentStatus.FAILED,
        error: 'Retry limit exceeded'
      });
      return false;
    }

    this.updateSession(sessionId, {
      retryCount: session.retryCount + 1,
      status: PaymentStatus.PENDING,
      error: undefined,
      expiresAt: new Date(Date.now() + this.TIMEOUT_MS)
    });

    this.setupSessionTimeout(sessionId);
    return true;
  }

  private cleanupTimeout(sessionId: string): void {
    const timeout = this.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }
  }

  public cleanupSession(sessionId: string): void {
    this.cleanupTimeout(sessionId);
    this.sessions.delete(sessionId);
  }

  private setupSessionTimeout(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Nettoyer l'ancien timeout s'il existe
    this.cleanupTimeout(sessionId);

    const timeout = setTimeout(() => {
      const currentSession = this.sessions.get(sessionId);
      if (!currentSession) return;

      if (currentSession.status === PaymentStatus.PENDING) {
        this.updateSession(sessionId, {
          status: PaymentStatus.TIMEOUT,
          error: 'Payment timeout exceeded'
        });
        this.cleanupTimeout(sessionId);
      }
    }, this.TIMEOUT_MS);

    this.timeouts.set(sessionId, timeout);
  }

  public cleanup(): void {
    // Nettoyer tous les timeouts
    for (const [sessionId, timeout] of this.timeouts) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }

    // Nettoyer toutes les sessions
    this.sessions.clear();

    // Nettoyer le service de synchronisation sans déclencher une boucle
    if (this.syncService) {
      this.syncService.cleanupWithoutRecursion();
    }
  }
}
