import { AbstractChainService } from '../payment/base/AbstractChainService';
import { 
  PaymentSession,
  PaymentStatus,
  PaymentToken,
  PaymentNetwork
} from '../payment/types';
import { Provider, JsonRpcProvider } from 'ethers';

export class PolygonPaymentService extends AbstractChainService {
  readonly chainName = 'Polygon';
  readonly supportedTokens: PaymentToken[] = [
    {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'MATIC',
      decimals: 18,
      network: PaymentNetwork.POLYGON
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      decimals: 6,
      network: PaymentNetwork.POLYGON
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      decimals: 6,
      network: PaymentNetwork.POLYGON
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      decimals: 18,
      network: PaymentNetwork.POLYGON
    }
  ];

  private readonly provider: Provider;
  private readonly destinationAddress = '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A';
  private readonly maxRetries = 3;
  private readonly defaultTimeout = 30000; // 30 secondes pour Polygon

  constructor() {
    super();
    this.provider = new JsonRpcProvider(
      process.env.VITE_POLYGON_RPC_URL
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

    // Vérifier la disponibilité du réseau Polygon
    const network = await this.provider.getNetwork();
    if (network.chainId !== 137n) { // Polygon Mainnet
      throw this.createPaymentError('Réseau Polygon non disponible', 'NETWORK_ERROR');
    }

    return {
      id: `poly_${Date.now()}_${params.userId}`,
      userId: params.userId,
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.POLYGON,
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
    const timeout = options?.timeout || this.defaultTimeout;
    let currentSession = { ...session };

    try {
      // Vérifier le solde avant la transaction
      await this.checkBalance(session);

      const txHash = await this.sendTransaction(session);
      
      currentSession = {
        ...currentSession,
        status: PaymentStatus.PROCESSING,
        txHash,
        updatedAt: Date.now()
      };

      // Attendre la confirmation avec un nombre de blocs plus faible pour Polygon
      const receipt = await this.provider.waitForTransaction(
        txHash,
        3, // Nombre de confirmations pour Polygon
        timeout
      );

      return {
        ...currentSession,
        status: receipt.status === 1 ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
        updatedAt: Date.now()
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return {
            ...currentSession,
            status: PaymentStatus.TIMEOUT,
            error: 'Transaction timeout',
            updatedAt: Date.now()
          };
        }

        await this.handleNetworkError(error);
        return {
          ...currentSession,
          status: PaymentStatus.FAILED,
          error: error.message,
          updatedAt: Date.now()
        };
      }

      return {
        ...currentSession,
        status: PaymentStatus.FAILED,
        error: 'Unknown error',
        updatedAt: Date.now()
      };
    }
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw this.createPaymentError('Session non trouvée', 'SESSION_NOT_FOUND');
    }

    if (session.txHash) {
      const isValid = await this.validateTransaction(session.txHash);
      if (isValid) {
        return PaymentStatus.CONFIRMED;
      }
    }

    return session.status;
  }

  async validateTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return false;

      // Pour Polygon, on considère valide après 3 confirmations
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      
      return receipt.status === 1 && confirmations >= 3;
    } catch (error) {
      console.error('Erreur lors de la validation de la transaction:', error);
      return false;
    }
  }

  protected async handleNetworkError(error: Error): Promise<void> {
    console.error('Polygon network error:', error);
    
    // Logique spécifique pour les erreurs Polygon
    if (error.message.includes('gas')) {
      // Augmenter le gas si nécessaire
      console.warn('Ajustement du gas pour Polygon');
    }

    // Implémenter la logique de retry si nécessaire
    if (error.message.includes('nonce')) {
      await this.resetNonce();
    }
  }

  private async checkBalance(session: PaymentSession): Promise<void> {
    if (session.token.address === '0x0000000000000000000000000000000000000000') {
      const balance = await this.provider.getBalance(this.destinationAddress);
      const amount = ethers.parseUnits(session.amount, 18);
      if (balance < amount) {
        throw this.createPaymentError('Solde insuffisant', 'INSUFFICIENT_BALANCE');
      }
    } else {
      // Vérifier le solde des tokens ERC20
      // À implémenter
    }
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

  private async resetNonce(): Promise<void> {
    // Réinitialiser le nonce en cas d'erreur
    // À implémenter
  }
}
