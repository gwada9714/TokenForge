import { WalletService, WalletReconnectionService, WalletState } from '../types/wallet';
import { WalletClient } from 'viem';
import { useWagmiHooks } from '../hooks/useWagmiHooks';

export class UnifiedWalletService implements WalletService, WalletReconnectionService {
  private static instance: UnifiedWalletService;
  private currentState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
    walletClient: null
  };
  private wagmiHooks: ReturnType<typeof useWagmiHooks>;

  private constructor() {
    this.wagmiHooks = useWagmiHooks();
    this.setupWagmiListeners();
  }

  static getInstance(): UnifiedWalletService {
    if (!UnifiedWalletService.instance) {
      UnifiedWalletService.instance = new UnifiedWalletService();
    }
    return UnifiedWalletService.instance;
  }

  private setupWagmiListeners(): void {
    const { walletClient, address, isConnected, chain } = this.wagmiHooks;

    if (walletClient && address && isConnected) {
      this.currentState = {
        isConnected: true,
        address,
        chainId: chain?.id || null,
        isCorrectNetwork: this.isCorrectChainId(chain?.id || 0),
        walletClient
      };
    }
  }

  async connect(): Promise<WalletState> {
    try {
      const { connector } = this.wagmiHooks;
      if (!connector) {
        throw new Error('No connector found');
      }

      await connector.connect();
      const { walletClient, address, chain } = this.wagmiHooks;

      if (!walletClient || !address || !chain) {
        throw new Error('Failed to connect wallet');
      }

      this.currentState = {
        isConnected: true,
        address,
        chainId: chain.id,
        isCorrectNetwork: this.isCorrectChainId(chain.id),
        walletClient
      };

      return this.currentState;
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  async disconnect(): Promise<void> {
    try {
      const { connector } = this.wagmiHooks;
      if (connector) {
        await connector.disconnect();
      }

      this.currentState = {
        isConnected: false,
        address: null,
        chainId: null,
        isCorrectNetwork: false,
        walletClient: null
      };
    } catch (error) {
      throw new Error('Failed to disconnect wallet');
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    try {
      const { switchNetwork } = this.wagmiHooks;
      if (!switchNetwork) {
        throw new Error('Network switching not supported');
      }

      await switchNetwork({ chainId });
      
      this.currentState = {
        ...this.currentState,
        chainId,
        isCorrectNetwork: this.isCorrectChainId(chainId)
      };
    } catch (error) {
      throw new Error('Failed to switch network');
    }
  }

  getWalletState(): WalletState {
    return { ...this.currentState };
  }

  async attemptReconnection(): Promise<boolean> {
    try {
      const { connector } = this.wagmiHooks;
      if (!connector) {
        return false;
      }

      await this.connect();
      return true;
    } catch {
      return false;
    }
  }

  cleanup(): void {
    this.disconnect();
  }

  private isCorrectChainId(chainId: number): boolean {
    // Vous pouvez définir ici les réseaux autorisés
    const allowedChainIds = [1, 5]; // Mainnet et Goerli
    return allowedChainIds.includes(chainId);
  }
}
