import { PaymentSession, PaymentStatus } from './types/PaymentSession';

const PAYMENT_SYNC_CHANNEL = 'payment_sync_channel';

interface PaymentSyncMessage {
  type: 'SESSION_UPDATE' | 'SESSION_CLEANUP';
  sessionId: string;
  data?: Partial<PaymentSession>;
  timestamp: number;
}

export interface IPaymentSessionManager {
  getSession(sessionId: string): PaymentSession | undefined;
  getSessions(): Map<string, PaymentSession>;
  updateSession(sessionId: string, updates: Partial<PaymentSession>): void;
  cleanupSession(sessionId: string): void;
  cleanup(): void;
}

export class PaymentSyncService {
  private static instance: PaymentSyncService;
  private sessionManager: IPaymentSessionManager;
  private broadcastChannel: BroadcastChannel;
  private lastProcessedTimestamp: number = 0;

  private constructor(sessionManager: IPaymentSessionManager) {
    this.sessionManager = sessionManager;
    this.broadcastChannel = new BroadcastChannel(PAYMENT_SYNC_CHANNEL);
    this.setupEventListeners();
  }

  public static getInstance(sessionManager: IPaymentSessionManager): PaymentSyncService {
    if (!PaymentSyncService.instance) {
      PaymentSyncService.instance = new PaymentSyncService(sessionManager);
    }
    return PaymentSyncService.instance;
  }

  private setupEventListeners(): void {
    this.broadcastChannel.onmessage = (event: MessageEvent<PaymentSyncMessage>) => {
      const message = event.data;
      
      // Ignorer les messages plus anciens que le dernier traité
      if (message.timestamp <= this.lastProcessedTimestamp) {
        return;
      }
      
      this.lastProcessedTimestamp = message.timestamp;
      
      switch (message.type) {
        case 'SESSION_UPDATE':
          if (message.data) {
            this.handleSessionUpdate(message.sessionId, message.data);
          }
          break;
        case 'SESSION_CLEANUP':
          this.handleSessionCleanup(message.sessionId);
          break;
      }
    };

    // Écouter les changements de visibilité pour la synchronisation
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncSessions();
      }
    });
  }

  private async handleSessionUpdate(sessionId: string, data?: Partial<PaymentSession>): Promise<void> {
    if (!data) return;

    const currentSession = this.sessionManager.getSession(sessionId);
    if (!currentSession) return;

    // Ne mettre à jour que si le statut est plus récent
    if (data.status && this.isStatusUpdateValid(currentSession.status, data.status)) {
      await this.sessionManager.updateSession(
        sessionId,
        { status: data.status, txHash: data.txHash, error: data.error }
      );
    }
  }

  private handleSessionCleanup(sessionId: string): void {
    const session = this.sessionManager.getSession(sessionId);
    if (session && this.isSessionExpired(session)) {
      this.sessionManager.cleanupSession(sessionId);
    }
  }

  private isStatusUpdateValid(currentStatus: PaymentStatus, newStatus: PaymentStatus): boolean {
    const statusPriority: Record<PaymentStatus, number> = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.PROCESSING]: 1,
      [PaymentStatus.CONFIRMED]: 2,
      [PaymentStatus.FAILED]: 2,
      [PaymentStatus.EXPIRED]: 2,
      [PaymentStatus.TIMEOUT]: 2
    };

    return statusPriority[newStatus] > statusPriority[currentStatus];
  }

  private isSessionExpired(session: PaymentSession): boolean {
    return session.expiresAt < new Date();
  }

  public broadcastSessionUpdate(sessionId: string, updates: Partial<PaymentSession>): void {
    const message: PaymentSyncMessage = {
      type: 'SESSION_UPDATE',
      sessionId,
      data: updates,
      timestamp: Date.now()
    };
    this.broadcastChannel.postMessage(message);
  }

  public broadcastSessionCleanup(sessionId: string): void {
    const message: PaymentSyncMessage = {
      type: 'SESSION_CLEANUP',
      sessionId,
      timestamp: Date.now()
    };
    this.broadcastChannel.postMessage(message);
  }

  private async syncSessions(): Promise<void> {
    const sessions = Array.from(this.sessionManager.getSessions().values());
    const pendingSessions = sessions.filter(
      (session: PaymentSession) => session.status === PaymentStatus.PENDING
    );

    for (const session of pendingSessions) {
      this.broadcastSessionUpdate(session.id, session);
    }
  }

  public cleanup(): void {
    this.broadcastChannel.close();
    this.sessionManager.cleanup();
  }
}
