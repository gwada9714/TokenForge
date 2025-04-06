import { BaseService, ServiceStatus } from "@/core/services/BaseService";
import { WalletState, WalletConfig } from "../types";
import { logger } from "@/core/logger/Logger";

export class WalletService extends BaseService {
  private static instance: WalletService;
  private state: WalletState;
  private readonly config: WalletConfig;

  private constructor(config: WalletConfig) {
    super({
      name: "WalletService",
      version: "1.0.0",
      environment: import.meta.env.MODE,
    });

    this.config = config;
    this.state = {
      address: null,
      chainId: null,
      connected: false,
      loading: false,
      error: null,
    };
  }

  static getInstance(config?: WalletConfig): WalletService {
    if (!WalletService.instance) {
      if (!config) {
        throw new Error("WalletService needs config for initialization");
      }
      WalletService.instance = new WalletService(config);
    }
    return WalletService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.log("Initializing Wallet Service");
      // Initialisation du wallet (à implémenter selon le provider choisi)
      this.status = ServiceStatus.READY;
      this.log("Wallet Service initialized successfully");
    } catch (error) {
      this.status = ServiceStatus.ERROR;
      this.logError("Failed to initialize Wallet Service", error as Error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    try {
      this.setState({ loading: true });
      // Logique de connexion au wallet (à implémenter)
      this.log("Wallet connected successfully");
    } catch (error) {
      this.logError("Failed to connect wallet", error as Error);
      this.setState({ error: error as Error });
      throw error;
    } finally {
      this.setState({ loading: false });
    }
  }

  private setState(partial: Partial<WalletState>): void {
    this.state = { ...this.state, ...partial };
  }

  getState(): WalletState {
    return { ...this.state };
  }

  async cleanup(): Promise<void> {
    // Nettoyage des ressources du wallet
  }
}
