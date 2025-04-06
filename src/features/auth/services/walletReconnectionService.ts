import { WalletClient, createWalletClient, custom } from "viem";
import { SUPPORTED_CHAINS } from "../../../types/common";
import { notificationService } from "../../../services/notification/notificationService";
import { tabSyncService } from "../../../services/sync/tabSyncService";
import { AUTH_ACTIONS } from "../constants";
import { logger } from "../../../core/logger";
import { TabSyncMessage } from "../../../types/tabSync";
import { BaseWalletState } from "../../../types/baseWalletState";

const LOG_CATEGORY = "WalletReconnectionService";

const firebaseConfig = {
  apiKey: "AlzaSyAWCGLD1B4aTGRdsaA-Xa-anx4EJ0ZAA",
  // autres paramètres...
};

export interface WalletState extends BaseWalletState {
  walletClient: WalletClient | null;
}

export interface WalletCallbacks {
  onConnect: (address: string, chainId: number) => void;
  onDisconnect: () => void;
  onNetworkChange: (chainId: number) => void;
  onWalletStateSync?: (state: BaseWalletState) => void;
  onError?: (error: unknown) => void;
}

type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

class WalletReconnectionService {
  private static instance: WalletReconnectionService;
  private isReconnecting = false;
  private isConnected = false;
  private address: string | null = null;
  private chainId: number | null = null;
  private walletClient: WalletClient | null = null;
  private callbacks: WalletCallbacks | null = null;
  private cleanupListeners: Array<() => void> = [];
  private tabId: string;
  private reconnectionAttempts = 0;
  private readonly MAX_RECONNECTION_ATTEMPTS = 3;
  private reconnectionTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.tabId = crypto.randomUUID();
    this.setupTabSync();
    this.setupNetworkChangeListener();
    this.setupAccountsChangedListener();
  }

  static getInstance(): WalletReconnectionService {
    if (!WalletReconnectionService.instance) {
      WalletReconnectionService.instance = new WalletReconnectionService();
    }
    return WalletReconnectionService.instance;
  }

  async startReconnection(): Promise<void> {
    if (this.isReconnecting || this.isConnected) return;

    this.isReconnecting = true;
    try {
      await this.attemptReconnection();
    } catch (error) {
      this.handleError(error, "startReconnection");
      if (this.reconnectionAttempts < this.MAX_RECONNECTION_ATTEMPTS) {
        this.scheduleReconnection();
      } else {
        notificationService.error("Échec de la reconnexion au portefeuille", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      }
    } finally {
      this.isReconnecting = false;
    }
  }

  private scheduleReconnection(): void {
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectionAttempts),
      30000
    );
    this.reconnectionTimeout = setTimeout(() => {
      this.reconnectionAttempts++;
      this.startReconnection();
    }, delay);
  }

  async attemptReconnection(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("Aucun fournisseur Ethereum trouvé");
    }

    try {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });

      const [address] = await walletClient.requestAddresses();
      const chainId = await walletClient.getChainId();

      await this.handleWalletConnection(address, chainId, walletClient);

      // Vérifier si le réseau est supporté
      if (!(chainId in SUPPORTED_CHAINS)) {
        notificationService.warning(
          "Le réseau actuel n'est pas supporté par TokenForge",
          {
            autoClose: 5000,
            hideProgressBar: false,
          }
        );
      } else {
        this.reconnectionAttempts = 0; // Réinitialiser le compteur en cas de succès
        notificationService.success("Portefeuille connecté avec succès", {
          autoClose: 3000,
          hideProgressBar: false,
        });
      }

      // Notifier les autres onglets
      this.broadcastWalletState({
        address,
        chainId,
        isConnected: true,
      });
    } catch (error) {
      this.handleError(error, "attemptReconnection");
      throw error;
    }
  }

  private async handleWalletConnection(
    address: string,
    chainId: number,
    walletClient: WalletClient
  ): Promise<void> {
    this.isConnected = true;
    this.address = address;
    this.chainId = chainId;
    this.walletClient = walletClient;

    this.callbacks?.onConnect(address, chainId);
  }

  private setupAccountsChangedListener(): void {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        this.handleDisconnect();
      } else {
        const chainId = await this.walletClient?.getChainId();
        if (chainId) {
          await this.handleWalletConnection(
            accounts[0],
            chainId,
            this.walletClient!
          );
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    this.cleanupListeners.push(() => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    });
  }

  private handleDisconnect(): void {
    this.isConnected = false;
    this.address = null;
    this.chainId = null;
    this.walletClient = null;
    this.callbacks?.onDisconnect();

    this.broadcastWalletState({
      address: null,
      chainId: null,
      isConnected: false,
    });
  }

  private broadcastWalletState(state: BaseWalletState): void {
    tabSyncService.broadcast({
      type: AUTH_ACTIONS.WALLET_STATE_CHANGE,
      payload: { state },
      timestamp: Date.now(),
      tabId: this.tabId,
      priority: 800,
    });
  }

  private handleError(error: unknown, context: string): void {
    logger.error(LOG_CATEGORY, {
      message: `Erreur dans ${context}`,
      error: error instanceof Error ? error.message : "Unknown error",
      context,
    });
    this.callbacks?.onError?.(error);
  }

  cleanup(): void {
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    }
    this.cleanupListeners.forEach((cleanup) => cleanup());
    this.cleanupListeners = [];
  }

  private setupTabSync(): void {
    tabSyncService.subscribe((message: TabSyncMessage) => {
      if (message.tabId === this.tabId) return;

      switch (message.type) {
        case AUTH_ACTIONS.WALLET_STATE_CHANGE:
          if (message.payload?.state) {
            this.handleWalletStateSync(message.payload.state);
          }
          break;
      }
    });
  }

  private setupNetworkChangeListener(): void {
    if (!window.ethereum) return;

    const handleNetworkChange = async (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);

      if (this.isSupportedChain(numericChainId)) {
        notificationService.success(
          `Réseau changé : ${
            SUPPORTED_CHAINS[numericChainId as SupportedChainId]
          }`
        );
      } else {
        notificationService.warning("Réseau non supporté par TokenForge");
      }

      if (this.chainId !== numericChainId) {
        this.chainId = numericChainId;
        this.callbacks?.onNetworkChange(numericChainId);
      }
    };

    window.ethereum.on("chainChanged", handleNetworkChange);
    this.cleanupListeners.push(() => {
      window.ethereum?.removeListener("chainChanged", handleNetworkChange);
    });
  }

  private isSupportedChain(chainId: number): chainId is SupportedChainId {
    return chainId in SUPPORTED_CHAINS;
  }

  private handleWalletStateSync(state: BaseWalletState): void {
    this.isConnected = state.isConnected;
    this.address = state.address;
    this.chainId = state.chainId;
    this.callbacks?.onWalletStateSync?.(state);
  }

  async checkReconnection(address: string): Promise<boolean> {
    return this.address !== address;
  }

  async handleReconnection(address: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error("Aucun fournisseur Ethereum trouvé");
    }

    try {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });

      const chainId = await walletClient.getChainId();
      await this.handleWalletConnection(address, chainId, walletClient);
    } catch (error) {
      this.handleError(error, "handleReconnection");
      throw error;
    }
  }
}

export const walletReconnectionService =
  WalletReconnectionService.getInstance();
