import { PaymentSession, PaymentStatus } from './types/PaymentSession';
import { PaymentSessionService } from './PaymentSessionService';

const PAYMENT_SYNC_CHANNEL = 'payment_sync_channel';

interface PaymentSyncMessage {
  type: 'SESSION_UPDATE' | 'SESSION_CLEANUP';
  sessionId: string;
  data?: Partial<PaymentSession>;
  timestamp: number;
}

export class PaymentSyncService {
  private static instance: PaymentSyncService;
  private sessionService: PaymentSessionService;
  private broadcastChannel: BroadcastChannel;
  private lastProcessedTimestamp: number = 0;

  private constructor() {
    this.sessionService = PaymentSessionService.getInstance();
    this.broadcastChannel = new BroadcastChannel(PAYMENT_SYNC_CHANNEL);
    this.setupEventListeners();
  }

  public static getInstance(): PaymentSyncService {
    if (!PaymentSyncService.instance) {
      PaymentSyncService.instance = new PaymentSyncService();
    }
    return PaymentSyncService.instance;
  }

  private setupEventListeners(): void {
    this.broadcastChannel.onmessage = (event: MessageEvent<PaymentSyncMessage>) => {
      // Éviter le traitement des messages plus anciens ou des doublons
      if (event.data.timestamp <= this.lastProcessedTimestamp) {
        return;
      }

      this.lastProcessedTimestamp = event.data.timestamp;

      switch (event.data.type) {
        case 'SESSION_UPDATE':
          this.handleSessionUpdate(event.data.sessionId, event.data.data);
          break;
        case 'SESSION_CLEANUP':
          this.handleSessionCleanup(event.data.sessionId);
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

    const currentSession = this.sessionService.getSession(sessionId);
    if (!currentSession) return;

    // Ne mettre à jour que si le statut est plus récent
    if (data.status && this.isStatusUpdateValid(currentSession.status, data.status)) {
      await this.sessionService.updateSessionStatus(
        sessionId,
        data.status,
        data.txHash,
        data.error
      );
    }
  }

  private handleSessionCleanup(sessionId: string): void {
    const session = this.sessionService.getSession(sessionId);
    if (session && this.isSessionExpired(session)) {
      this.sessionService.cleanup();
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

  public syncSession(session: PaymentSession): void {
    const message: PaymentSyncMessage = {
      type: 'SESSION_UPDATE',
      sessionId: session.id,
      data: session,
      timestamp: Date.now()
    };
    this.broadcastChannel.postMessage(message);
  }

  public cleanupSession(sessionId: string): void {
    const message: PaymentSyncMessage = {
      type: 'SESSION_CLEANUP',
      sessionId,
      timestamp: Date.now()
    };
    this.broadcastChannel.postMessage(message);
  }

  private async syncSessions(): Promise<void> {
    const sessions = Array.from(this.sessionService.getSessions().values());
    const pendingSessions = sessions.filter(
      (session: PaymentSession) => session.status === PaymentStatus.PENDING
    );

    for (const session of pendingSessions) {
      this.syncSession(session);
    }
  }

  public cleanup(): void {
    this.broadcastChannel.close();
  }
}
