import { v4 as uuidv4 } from 'uuid';
import { PaymentSession, PaymentStatus, PaymentToken } from './types/PaymentSession';
import { PaymentSyncService } from './PaymentSyncService';

export class PaymentSessionService {
  private static instance: PaymentSessionService;
  private sessions: Map<string, PaymentSession>;
  private timeouts: Map<string, NodeJS.Timeout>;
  private syncService: PaymentSyncService;
  private readonly RETRY_LIMIT = 3;
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  private constructor() {
    this.sessions = new Map();
    this.timeouts = new Map();
    this.syncService = PaymentSyncService.getInstance();
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
    const session: PaymentSession = {
      id: uuidv4(),
      userId,
      status: PaymentStatus.PENDING,
      network: token.network,
      token,
      amount,
      serviceType,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + this.TIMEOUT_MS),
      retryCount: 0
    };

    this.sessions.set(session.id, session);
    this.setupTimeout(session.id);
    this.syncService.syncSession(session);

    return session;
  }

  public getSession(sessionId: string): PaymentSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getSessions(): Map<string, PaymentSession> {
    return this.sessions;
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

    // Clear timeout if status is final
    if (status !== PaymentStatus.PENDING) {
      this.clearTimeout(sessionId);
    }

    const updatedSession: PaymentSession = {
      ...session,
      status,
      txHash,
      error,
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, updatedSession);
    this.syncService.syncSession(updatedSession);
    return updatedSession;
  }

  public async retryPayment(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.retryCount >= this.RETRY_LIMIT) {
      this.updateSessionStatus(
        sessionId,
        PaymentStatus.FAILED,
        undefined,
        'Retry limit exceeded'
      );
      return false;
    }

    const updatedSession: PaymentSession = {
      ...session,
      retryCount: session.retryCount + 1,
      status: PaymentStatus.PENDING,
      error: undefined,
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, updatedSession);
    this.syncService.syncSession(updatedSession);
    this.setupTimeout(sessionId);
    return true;
  }

  private setupTimeout(sessionId: string): void {
    this.clearTimeout(sessionId);

    const timeout = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.status === PaymentStatus.PENDING) {
        this.updateSessionStatus(
          sessionId,
          PaymentStatus.TIMEOUT,
          undefined,
          'Payment timeout'
        );
      }
    }, this.TIMEOUT_MS);

    this.timeouts.set(sessionId, timeout);
  }

  private clearTimeout(sessionId: string): void {
    const timeout = this.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }
  }

  public cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt.getTime() > maxAgeMs) {
        this.sessions.delete(sessionId);
        this.clearTimeout(sessionId);
        this.syncService.cleanupSession(sessionId);
      }
    }
  }

  public cleanup(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.sessions.clear();
    this.syncService.cleanup();
  }
}
