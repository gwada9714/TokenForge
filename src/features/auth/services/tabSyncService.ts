import { BroadcastChannel } from "broadcast-channel";
import { TokenForgeUser } from "../types";
import { AUTH_ACTIONS } from "../actions/authActions";
import { AuthState } from "../types";

const SYNC_CHANNEL = "tokenforge_auth_sync";
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
  private stateQueue: Map<
    string,
    { message: SyncMessage; timeout: NodeJS.Timeout }
  >;
  private conflictResolvers: Map<string, StateConflictResolver>;
  private currentState: Map<string, any>;

  private constructor() {
    this.tabId = window.crypto.randomUUID();
    this.channel = new BroadcastChannel(SYNC_CHANNEL, {
      webWorkerSupport: true,
    });
    this.subscribers = [];
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

  private setupConflictResolvers(): void {
    // Résolveur pour l'état utilisateur
    this.conflictResolvers.set(
      AUTH_ACTIONS.UPDATE_USER,
      (current: TokenForgeUser | null, incoming: TokenForgeUser | null) => {
        if (!current) return incoming;
        if (!incoming) return current;

        const lastLoginTime = Math.max(
          current.lastLoginTime ?? 0,
          incoming.lastLoginTime ?? 0
        );

        return {
          ...current,
          ...incoming,
          lastLoginTime: lastLoginTime || undefined,
        };
      }
    );

    // Résolveur pour l'état du wallet
    this.conflictResolvers.set(
      AUTH_ACTIONS.WALLET_CONNECT,
      (current, incoming) => {
        if (!current) return incoming;
        if (!incoming) return current;
        return incoming.timestamp > current.timestamp ? incoming : current;
      }
    );
  }

  private setupListeners(): void {
    this.channel.onmessage = (event) => {
      const message = event.data as SyncMessage;
      if (message.tabId !== this.tabId) {
        this.queueStateUpdate(message);
      }
    };
  }

  private queueStateUpdate(message: SyncMessage): void {
    const existing = this.stateQueue.get(message.type);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    const timeout = setTimeout(() => {
      this.processStateUpdate(message);
      this.stateQueue.delete(message.type);
    }, STATE_DEBOUNCE_MS);

    this.stateQueue.set(message.type, { message, timeout });
  }

  private processStateUpdate(message: SyncMessage): void {
    const resolver = this.conflictResolvers.get(message.type);
    if (!resolver) {
      this.notifySubscribers(message);
      return;
    }

    const currentState = this.getCurrentState(message.type);
    const newState = resolver(currentState, message.payload);
    this.updateCurrentState(message.type, newState);

    this.notifySubscribers({
      ...message,
      payload: newState,
    });
  }

  private getCurrentState(actionType: string): any {
    return this.currentState.get(actionType);
  }

  private updateCurrentState(actionType: string, state: any): void {
    this.currentState.set(actionType, state);
  }

  private notifySubscribers(message: SyncMessage): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in tab sync subscriber:", error);
      }
    });
  }

  subscribe(callback: (message: SyncMessage) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  broadcast(message: SyncMessage): void {
    message.tabId = this.tabId;
    message.timestamp = Date.now();
    this.channel.postMessage(message);
  }

  async close(): Promise<void> {
    this.stateQueue.forEach(({ timeout }) => clearTimeout(timeout));
    this.stateQueue.clear();
    await this.channel.close();
  }

  syncAuthState(state: AuthState) {
    this.broadcast({
      type: "auth_state_change",
      payload: state,
      timestamp: Date.now(),
      tabId: this.tabId,
    });
  }
}

export const tabSyncService = TabSyncService.getInstance();
