import { AbstractChainService } from "../payment/base/AbstractChainService";
import {
  PaymentSession,
  PaymentStatus,
  PaymentToken,
  PaymentNetwork,
} from "../payment/types";
import { ethers } from "ethers";

export class BinancePaymentService extends AbstractChainService {
  readonly chainName = "Binance Smart Chain";
  readonly supportedTokens: PaymentToken[] = [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "BNB",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
    {
      address: "0x55d398326f99059fF775485246999027B3197955",
      symbol: "USDT",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
    {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      symbol: "USDC",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol: "BUSD",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
  ];

  private readonly provider: ethers.Provider;
  private readonly destinationAddress =
    "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A";
  private readonly maxRetries = 3;
  private readonly defaultTimeout = 15000; // 15 secondes pour BSC

  constructor() {
    super();
    this.provider = new ethers.JsonRpcProvider(process.env.VITE_BSC_RPC_URL);
  }

  async createPaymentSession(params: {
    userId: string;
    token: PaymentToken;
    amount: string;
  }): Promise<PaymentSession> {
    if (!this.validateAmount(params.amount)) {
      throw this.createPaymentError("Montant invalide", "INVALID_AMOUNT");
    }

    if (!this.validateToken(params.token)) {
      throw this.createPaymentError("Token non supporté", "UNSUPPORTED_TOKEN");
    }

    // Vérifier la disponibilité du réseau BSC
    const network = await this.provider.getNetwork();
    if (network.chainId !== 56n) {
      // BSC Mainnet
      throw this.createPaymentError(
        "Réseau BSC non disponible",
        "NETWORK_ERROR"
      );
    }

    return {
      id: `bsc_${Date.now()}_${params.userId}`,
      userId: params.userId,
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.BINANCE,
      token: params.token,
      amount: params.amount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
    };
  }

  async processPayment(
    session: PaymentSession,
    options?: { timeout?: number }
  ): Promise<PaymentSession> {
    const timeout = options?.timeout || this.defaultTimeout;
    let currentSession = { ...session };

    try {
      // Vérifier le solde et les approbations pour les tokens BEP20
      await this.checkBalanceAndAllowance(session);

      const txHash = await this.sendTransaction(session);

      currentSession = {
        ...currentSession,
        status: PaymentStatus.PROCESSING,
        txHash,
        updatedAt: Date.now(),
      };

      // BSC nécessite moins de confirmations
      const receipt = await this.provider.waitForTransaction(
        txHash,
        1, // Une confirmation suffit sur BSC
        timeout
      );

      if (!receipt) {
        throw new Error("Transaction non trouvée");
      }

      return {
        ...currentSession,
        status:
          receipt.status === 1 ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED,
        updatedAt: Date.now(),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          return {
            ...currentSession,
            status: PaymentStatus.TIMEOUT,
            error: "Transaction timeout",
            updatedAt: Date.now(),
          };
        }

        await this.handleNetworkError(error);
        return {
          ...currentSession,
          status: PaymentStatus.FAILED,
          error: error.message,
          updatedAt: Date.now(),
        };
      }

      return {
        ...currentSession,
        status: PaymentStatus.FAILED,
        error: "Unknown error",
        updatedAt: Date.now(),
      };
    }
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw this.createPaymentError("Session non trouvée", "SESSION_NOT_FOUND");
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

      // Pour BSC, une confirmation suffit
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return receipt.status === 1 && confirmations >= 1;
    } catch (error) {
      console.error("Erreur lors de la validation de la transaction:", error);
      return false;
    }
  }

  protected async handleNetworkError(error: Error): Promise<void> {
    console.error("BSC network error:", error);

    // Logique spécifique pour les erreurs BSC
    if (error.message.includes("gas")) {
      // Ajuster le gas pour BSC
      console.warn("Ajustement du gas pour BSC");
    }

    // Gérer les erreurs de nonce
    if (error.message.includes("nonce")) {
      await this.resetNonce();
    }
  }

  private async checkBalanceAndAllowance(
    session: PaymentSession
  ): Promise<void> {
    if (
      session.token.address === "0x0000000000000000000000000000000000000000"
    ) {
      // Vérifier le solde BNB
      const balance = await this.provider.getBalance(this.destinationAddress);
      const amount = ethers.parseUnits(session.amount, 18);
      if (balance < amount) {
        throw this.createPaymentError(
          "Solde BNB insuffisant",
          "INSUFFICIENT_BALANCE"
        );
      }
    } else {
      // Vérifier le solde et l'allowance des tokens BEP20
      // À implémenter avec les contrats BEP20
    }
  }

  private async sendTransaction(session: PaymentSession): Promise<string> {
    // Logique d'envoi de transaction à implémenter
    // Pour l'instant, retourne un hash fictif
    return `0x${Array(64).fill("0").join("")}`;
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
