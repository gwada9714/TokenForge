import { TokenForgeUser } from '../types';
import { AUTH_ACTIONS } from '../actions/authActions';

const SYNC_CHANNEL = 'tokenforge_auth_sync';
const STATE_DEBOUNCE_MS = 100;

type SyncMessage = {
  type: string;
  payload?: any;
  timestamp: number;
  tabId: string;
  priority?: number;
};

type StateConflictResolver = (current: any, incoming: any) => any;

class TabSyncService {
  private static instance: TabSyncService | null = null;
  private channel: BroadcastChannel;
  private tabId: string;
  private subscribers: Array<(message: SyncMessage) => void>;
  private lastProcessedTimestamp: number;
  private stateQueue: Map<string, { message: SyncMessage; timeout: NodeJS.Timeout }>;
  private conflictResolvers: Map<string, StateConflictResolver>;
  private currentState: Map<string, any>;

  private constructor() {
    this.tabId = window.crypto.randomUUID();
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.subscribers = [];
    this.lastProcessedTimestamp = Date.now();
    this.stateQueue = new Map();
    this.conflictResolvers = new Map();
    this.currentState = new Map();
    this.setupConflictResolvers();
    this.setupListeners();
  }

  static getInstance(): TabSyncService {
    if (!TabSyncService.instance) {
      TabSyncService.instance = new TabSyncService();
    }
    return TabSyncService.instance;
  }

  private setupConflictResolvers() {
    // Résolveur pour l'état utilisateur
    this.conflictResolvers.set(AUTH_ACTIONS.UPDATE_USER, (current: TokenForgeUser | null, incoming: TokenForgeUser | null) => {
      if (!current) return incoming;
      if (!incoming) return current;
      return {
        ...current,
        ...incoming,
        lastLoginTime: Math.max(current.lastLoginTime || 0, incoming.lastLoginTime || 0)
      };
    });

    // Résolveur pour l'état du wallet
    this.conflictResolvers.set(AUTH_ACTIONS.WALLET_CONNECT, (current, incoming) => {
      if (!current) return incoming;
      if (!incoming) return current;
      return incoming.timestamp > current.timestamp ? incoming : current;
    });
  }

  private setupListeners(): void {
    this.channel.onmessage = (event) => {
      const message: SyncMessage = event.data;
      
      // Ignore les messages de notre propre onglet
      if (message.tabId === this.tabId) return;
      
      // Ignore les messages plus anciens que le dernier traité
      if (message.timestamp < this.lastProcessedTimestamp) return;

      this.queueStateUpdate(message);
    };

    window.addEventListener('beforeunload', () => {
      this.broadcast({
        type: AUTH_ACTIONS.LOGOUT,
        timestamp: Date.now(),
        tabId: this.tabId,
        priority: 1000 // Priorité haute pour la déconnexion
      });
      this.channel.close();
    });
  }

  private queueStateUpdate(message: SyncMessage): void {
    // Annuler la mise à jour précédente du même type si elle existe
    const existing = this.stateQueue.get(message.type);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    // Créer un nouveau timeout pour cette mise à jour
    const timeout = setTimeout(() => {
      this.processStateUpdate(message);
      this.stateQueue.delete(message.type);
    }, STATE_DEBOUNCE_MS);

    this.stateQueue.set(message.type, { message, timeout });
  }

  private processStateUpdate(message: SyncMessage): void {
    // Mettre à jour le timestamp du dernier message traité
    this.lastProcessedTimestamp = message.timestamp;

    // Résoudre les conflits si nécessaire
    const resolver = this.conflictResolvers.get(message.type);
    if (resolver) {
      message.payload = resolver(this.getCurrentState(message.type), message.payload);
    }

    // Mettre à jour l'état actuel
    this.updateCurrentState(message.type, message.payload);

    // Notifier les abonnés
    this.notifySubscribers(message);
  }

  private getCurrentState(actionType: string): any {
    return this.currentState.get(actionType);
  }

  private updateCurrentState(actionType: string, state: any): void {
    this.currentState.set(actionType, state);
  }

  private notifySubscribers(message: SyncMessage): void {
    this.subscribers.forEach(subscriber => subscriber(message));
  }

  subscribe(callback: (message: SyncMessage) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  broadcast(message: SyncMessage): void {
    this.channel.postMessage({
      ...message,
      timestamp: Date.now(),
      tabId: this.tabId,
      priority: message.priority || 0
    });
  }

  syncAuthState(state: Partial<TokenForgeUser>): void {
    this.broadcast({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: state,
      timestamp: Date.now(),
      tabId: this.tabId,
      priority: 500 // Priorité moyenne pour les mises à jour d'état
    });
  }

  syncWalletState(walletState: { isConnected: boolean; address: string | null; chainId: number | null }): void {
    this.broadcast({
      type: AUTH_ACTIONS.WALLET_CONNECT,
      payload: { ...walletState, timestamp: Date.now() },
      timestamp: Date.now(),
      tabId: this.tabId,
      priority: 800 // Priorité haute pour les mises à jour du wallet
    });
  }

  close(): void {
    // Nettoyer tous les timeouts en attente
    this.stateQueue.forEach(({ timeout }) => clearTimeout(timeout));
    this.stateQueue.clear();
    this.channel.close();
  }
}

export const tabSyncService = TabSyncService.getInstance();
