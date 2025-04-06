import { PaymentSession, PaymentStatus } from "../types";
import { EventEmitter } from "eventemitter3";

/**
 * Interface pour les messages de synchronisation
 * @interface SyncMessage
 */
interface SyncMessage {
  type: "SESSION_UPDATE" | "SESSION_DELETE" | "STATUS_UPDATE";
  payload: any;
  timestamp: number;
}

/**
 * Service de synchronisation des sessions de paiement entre onglets
 * @class PaymentSessionSync
 * @extends EventEmitter
 *
 * @fires PaymentSessionSync#sessionUpdated
 * @fires PaymentSessionSync#statusUpdated
 * @fires PaymentSessionSync#sessionDeleted
 */
export class PaymentSessionSync extends EventEmitter {
  private readonly channel: BroadcastChannel;
  private readonly sessionCache: Map<string, PaymentSession>;

  /**
   * Crée une nouvelle instance du service de synchronisation
   */
  constructor() {
    super();
    this.channel = new BroadcastChannel("payment_sync");
    this.sessionCache = new Map();
    this.setupListeners();
  }

  /**
   * Configure les écouteurs d'événements
   * @private
   */
  private setupListeners(): void {
    this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload, timestamp } = event.data;

      switch (type) {
        case "SESSION_UPDATE":
          this.handleSessionUpdate(payload, timestamp);
          break;
        case "STATUS_UPDATE":
          this.handleStatusUpdate(payload, timestamp);
          break;
        case "SESSION_DELETE":
          this.handleSessionDelete(payload);
          break;
      }
    };
  }

  /**
   * Gère la mise à jour d'une session
   * @private
   * @param {PaymentSession} session - Session à mettre à jour
   * @param {number} timestamp - Timestamp de la mise à jour
   * @fires PaymentSessionSync#sessionUpdated
   */
  private handleSessionUpdate(
    session: PaymentSession,
    timestamp: number
  ): void {
    const cachedSession = this.sessionCache.get(session.id);
    if (!cachedSession || cachedSession.updatedAt < timestamp) {
      this.sessionCache.set(session.id, session);
      this.emit("sessionUpdated", session);
    }
  }

  /**
   * Gère la mise à jour du statut d'une session
   * @private
   * @param {Object} params - Paramètres de mise à jour
   * @param {string} params.sessionId - ID de la session
   * @param {PaymentStatus} params.status - Nouveau statut
   * @param {number} timestamp - Timestamp de la mise à jour
   * @fires PaymentSessionSync#statusUpdated
   */
  private handleStatusUpdate(
    { sessionId, status }: { sessionId: string; status: PaymentStatus },
    timestamp: number
  ): void {
    const session = this.sessionCache.get(sessionId);
    if (session && session.updatedAt < timestamp) {
      const updatedSession = {
        ...session,
        status,
        updatedAt: timestamp,
      };
      this.sessionCache.set(sessionId, updatedSession);
      this.emit("statusUpdated", updatedSession);
    }
  }

  /**
   * Gère la suppression d'une session
   * @private
   * @param {string} sessionId - ID de la session à supprimer
   * @fires PaymentSessionSync#sessionDeleted
   */
  private handleSessionDelete(sessionId: string): void {
    this.sessionCache.delete(sessionId);
    this.emit("sessionDeleted", sessionId);
  }

  /**
   * Met à jour une session et notifie les autres onglets
   * @public
   * @param {PaymentSession} session - Session à mettre à jour
   */
  public updateSession(session: PaymentSession): void {
    const message: SyncMessage = {
      type: "SESSION_UPDATE",
      payload: session,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
    this.handleSessionUpdate(session, message.timestamp);
  }

  /**
   * Met à jour le statut d'une session et notifie les autres onglets
   * @public
   * @param {string} sessionId - ID de la session
   * @param {PaymentStatus} status - Nouveau statut
   */
  public updateStatus(sessionId: string, status: PaymentStatus): void {
    const message: SyncMessage = {
      type: "STATUS_UPDATE",
      payload: { sessionId, status },
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
    this.handleStatusUpdate(message.payload, message.timestamp);
  }

  /**
   * Supprime une session et notifie les autres onglets
   * @public
   * @param {string} sessionId - ID de la session à supprimer
   */
  public deleteSession(sessionId: string): void {
    const message: SyncMessage = {
      type: "SESSION_DELETE",
      payload: sessionId,
      timestamp: Date.now(),
    };
    this.channel.postMessage(message);
    this.handleSessionDelete(sessionId);
  }

  /**
   * Récupère une session du cache
   * @public
   * @param {string} sessionId - ID de la session
   * @returns {PaymentSession | undefined} Session trouvée ou undefined
   */
  public getSession(sessionId: string): PaymentSession | undefined {
    return this.sessionCache.get(sessionId);
  }

  /**
   * Nettoie les ressources du service
   * @public
   */
  public cleanup(): void {
    this.channel.close();
    this.sessionCache.clear();
    this.removeAllListeners();
  }
}
