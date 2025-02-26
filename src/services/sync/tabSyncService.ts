import { BaseWalletState } from '../types/baseWalletState';

interface TabSyncMessage {
  type: string;
  payload?: {
    state?: BaseWalletState;
    chainId?: number;
  };
  timestamp: number;
  tabId: string;
  priority?: number;
}

type MessageHandler = (message: TabSyncMessage) => void;

class TabSyncService {
  private static instance: TabSyncService;
  private handlers: Set<MessageHandler> = new Set();
  private channel: BroadcastChannel;

  private constructor() {
    this.channel = new BroadcastChannel('tokenforge_tab_sync');
    this.setupMessageListener();
  }

  static getInstance(): TabSyncService {
    if (!TabSyncService.instance) {
      TabSyncService.instance = new TabSyncService();
    }
    return TabSyncService.instance;
  }

  private setupMessageListener(): void {
    this.channel.onmessage = (event) => {
      const message = event.data as TabSyncMessage;
      this.handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in tab sync handler:', error);
        }
      });
    };
  }

  broadcast(message: TabSyncMessage): void {
    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  cleanup(): void {
    this.handlers.clear();
    this.channel.close();
  }
}

export const tabSyncService = TabSyncService.getInstance();