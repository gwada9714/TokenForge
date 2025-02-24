import { AbstractChainService } from '../payment/base/AbstractChainService';
import { 
  PaymentSession,
  PaymentStatus,
  PaymentToken,
  PaymentNetwork
} from '../payment/types';
import { Provider, JsonRpcProvider } from 'ethers';

export class EthereumPaymentService extends AbstractChainService {
  readonly chainName = 'Ethereum';
  readonly supportedTokens: PaymentToken[] = [
    {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      decimals: 18,
      network: PaymentNetwork.ETHEREUM
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
      network: PaymentNetwork.ETHEREUM
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
      network: PaymentNetwork.ETHEREUM
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
      network: PaymentNetwork.ETHEREUM
    }
  ];

  private readonly provider: Provider;
  private readonly destinationAddress = '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A';

  constructor() {
    super();
    this.provider = new JsonRpcProvider(
      process.env.VITE_ETHEREUM_RPC_URL
    );
  }

  async createPaymentSession(params: {
    userId: string;
    token: PaymentToken;
    amount: string;
  }): Promise<PaymentSession> {
    if (!this.validateAmount(params.amount)) {
      throw this.createPaymentError('Montant invalide', 'INVALID_AMOUNT');
    }

    if (!this.validateToken(params.token)) {
      throw this.createPaymentError('Token non supporté', 'UNSUPPORTED_TOKEN');
    }

    return {
      id: `eth_${Date.now()}_${params.userId}`,
      userId: params.userId,
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.ETHEREUM,
      token: params.token,
      amount: params.amount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0
    };
  }

  async processPayment(
    session: PaymentSession,
    options?: { timeout?: number }
  ): Promise<PaymentSession> {
    try {
      const txHash = await this.sendTransaction(session);
      
      const updatedSession = {
        ...session,
        status: PaymentStatus.PROCESSING,
        txHash,
        updatedAt: Date.now()
      };

      // Attendre la confirmation
      const receipt = await this.provider.waitForTransaction(
        txHash,
        1,
        options?.timeout || 60000
      );

      return {
        ...updatedSession,
        status: receipt.status === 1 ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
        updatedAt: Date.now()
      };
    } catch (error) {
      await this.handleNetworkError(error as Error);
      return {
        ...session,
        status: PaymentStatus.FAILED,
        error: (error as Error).message,
        updatedAt: Date.now()
      };
    }
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw this.createPaymentError('Session non trouvée', 'SESSION_NOT_FOUND');
    }
    return session.status;
  }

  async validateTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt?.status === 1;
    } catch (error) {
      return false;
    }
  }

  protected async handleNetworkError(error: Error): Promise<void> {
    console.error('Ethereum network error:', error);
    // Implémenter la logique de retry si nécessaire
  }

  private async sendTransaction(session: PaymentSession): Promise<string> {
    // Logique d'envoi de transaction à implémenter
    // Pour l'instant, retourne un hash fictif
    return `0x${Array(64).fill('0').join('')}`;
  }

  private async getSession(sessionId: string): Promise<PaymentSession | null> {
    // À implémenter avec la vraie logique de stockage
    return null;
  }
}
