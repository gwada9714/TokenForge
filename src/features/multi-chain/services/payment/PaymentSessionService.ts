import { v4 as uuidv4 } from "uuid";
import {
  PaymentSession,
  PaymentStatus,
  PaymentNetwork,
  PaymentToken,
} from "./types/PaymentSession";
import EventEmitter from "events";

interface CreateSessionParams {
  network: PaymentNetwork;
  token: PaymentToken;
  amount: bigint;
  serviceType: string;
  userId: string;
}

type SessionUpdateCallback = (session: PaymentSession) => void;

export class PaymentSessionService {
  private static instance: PaymentSessionService;
  private sessions: Map<string, PaymentSession>;
  private timeouts: Map<string, NodeJS.Timeout>;
  private eventEmitter: EventEmitter;
  private readonly RETRY_LIMIT = 3;
  private readonly TIMEOUT_MS = 10000; // 10 seconds
  private readonly SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.sessions = new Map();
    this.timeouts = new Map();
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): PaymentSessionService {
    if (!PaymentSessionService.instance) {
      PaymentSessionService.instance = new PaymentSessionService();
    }
    return PaymentSessionService.instance;
  }

  public async createSession(
    params: CreateSessionParams
  ): Promise<PaymentSession> {
    const sessionId = uuidv4();
    const now = new Date();

    const session: PaymentSession = {
      id: sessionId,
      userId: params.userId,
      status: "PENDING",
      network: params.network,
      token: params.token,
      amount: params.amount,
      serviceType: params.serviceType,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + this.SESSION_EXPIRY_MS),
      retryCount: 0,
    };

    this.sessions.set(sessionId, session);
    this.setupSessionTimeout(sessionId);

    return session;
  }

  public getSession(sessionId: string): PaymentSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllUserSessions(userId: string): PaymentSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  public updateSessionStatus(
    sessionId: string,
    status: PaymentStatus,
    txHash?: string,
    error?: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const updatedSession: PaymentSession = {
      ...session,
      status,
      txHash,
      error,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    this.eventEmitter.emit(`session:${sessionId}`, updatedSession);

    if (status === "COMPLETED" || status === "FAILED") {
      this.cleanupSession(sessionId);
    }
  }

  public onSessionUpdate(
    sessionId: string,
    callback: SessionUpdateCallback
  ): () => void {
    const eventName = `session:${sessionId}`;
    this.eventEmitter.on(eventName, callback);
    return () => this.eventEmitter.off(eventName, callback);
  }

  private setupSessionTimeout(sessionId: string): void {
    const timeout = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.status === "PENDING") {
        this.updateSessionStatus(
          sessionId,
          "FAILED",
          undefined,
          "Session expired"
        );
      }
    }, this.SESSION_EXPIRY_MS);

    this.timeouts.set(sessionId, timeout);
  }

  public cleanupSession(sessionId: string): void {
    const timeout = this.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }
    this.sessions.delete(sessionId);
    this.eventEmitter.removeAllListeners(`session:${sessionId}`);
  }

  public cleanup(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.sessions.clear();
    this.eventEmitter.removeAllListeners();
  }
}
