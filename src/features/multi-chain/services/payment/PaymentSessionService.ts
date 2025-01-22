import { v4 as uuidv4 } from 'uuid';
import { BigNumber } from 'ethers';
import { PaymentSession, PaymentStatus, PaymentToken } from './types/PaymentSession';

export class PaymentSessionService {
  private static instance: PaymentSessionService;
  private sessions: Map<string, PaymentSession>;
  private timeouts: Map<string, NodeJS.Timeout>;
  private readonly RETRY_LIMIT = 3;
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  private constructor() {
    this.sessions = new Map();
    this.timeouts = new Map();
  }

  public static getInstance(): PaymentSessionService {
    if (!PaymentSessionService.instance) {
      PaymentSessionService.instance = new PaymentSessionService();
    }
    return PaymentSessionService.instance;
  }

  public createSession(
    userId: string,
    amount: BigNumber,
    token: PaymentToken,
    serviceType: PaymentSession['serviceType']
  ): PaymentSession {
    const session: PaymentSession = {
      id: uuidv4(),
      userId,
      amount,
      token,
      status: PaymentStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      serviceType
    };

    this.sessions.set(session.id, session);
    this.startPaymentTimeout(session.id);
    return session;
  }

  public getSession(sessionId: string): PaymentSession | undefined {
    return this.sessions.get(sessionId);
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
      updatedAt: Date.now(),
    };

    this.sessions.set(sessionId, updatedSession);
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
      updatedAt: Date.now(),
    };

    this.sessions.set(sessionId, updatedSession);
    this.startPaymentTimeout(sessionId);
    return true;
  }

  private startPaymentTimeout(sessionId: string): void {
    // Clear any existing timeout
    this.clearTimeout(sessionId);

    // Set new timeout
    const timeout = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.status === PaymentStatus.PENDING) {
        this.updateSessionStatus(
          sessionId,
          PaymentStatus.TIMEOUT,
          undefined,
          'Payment timeout exceeded'
        );
      }
    }, this.TIMEOUT_MS);

    this.timeouts.set(sessionId, timeout);
  }

  private clearTimeout(sessionId: string): void {
    const existingTimeout = this.timeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(sessionId);
    }
  }

  public cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt > maxAgeMs) {
        this.clearTimeout(sessionId);
        this.sessions.delete(sessionId);
      }
    }
  }

  // Cleanup method to be called when service is no longer needed
  public cleanup(): void {
    for (const sessionId of this.timeouts.keys()) {
      this.clearTimeout(sessionId);
    }
    this.sessions.clear();
  }
}
