import { ethers } from "ethers";
import { AbstractChainService } from "./base/AbstractChainService";
import {
  PaymentNetwork,
  PaymentSession,
  PaymentStatus,
  PaymentToken,
  PaymentError,
} from "./types";
import { ERC20_ABI } from "../constants/abis";

/**
 * Service de paiement pour le réseau BNB Smart Chain (BSC)
 * Gère les paiements en BNB natif et tokens BEP20
 * @class BSCPaymentService
 * @extends AbstractChainService
 */
export class BSCPaymentService extends AbstractChainService {
  private provider: ethers.JsonRpcProvider;
  private readonly chainId: number;

  public readonly chainName = PaymentNetwork.BINANCE;
  public readonly supportedTokens: PaymentToken[] = [
    {
      symbol: "BNB",
      address: "BNB",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
  ];

  /**
   * Crée une nouvelle instance du service de paiement BSC
   * @constructor
   * @param {string} rpcUrl - URL du nœud RPC BSC
   * @param {number} chainId - ID de la chaîne BSC
   */
  constructor(rpcUrl: string, chainId: number) {
    super();
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.chainId = chainId;
  }

  /**
   * Crée une nouvelle session de paiement
   * @public
   * @override
   * @param {Object} params - Paramètres de la session
   * @param {string} params.userId - Identifiant de l'utilisateur
   * @param {PaymentToken} params.token - Token utilisé pour le paiement
   * @param {string} params.amount - Montant du paiement
   * @returns {Promise<PaymentSession>} Session de paiement créée
   * @throws {PaymentError} Si les paramètres sont invalides
   */
  public async createPaymentSession(params: {
    userId: string;
    token: PaymentToken;
    amount: string;
  }): Promise<PaymentSession> {
    const { userId, token, amount } = params;

    if (!this.validateToken(token)) {
      throw this.createPaymentError("Token non supporté", "INVALID_TOKEN");
    }

    if (!this.validateAmount(amount)) {
      throw this.createPaymentError("Montant invalide", "INVALID_AMOUNT");
    }

    return {
      id: crypto.randomUUID(),
      userId,
      network: this.chainName,
      token,
      amount,
      status: PaymentStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retryCount: 0,
      txHash: undefined,
      error: undefined,
    };
  }

  /**
   * Traite un paiement
   * @public
   * @override
   * @param {PaymentSession} session - Session de paiement à traiter
   * @param {Object} [options] - Options de traitement
   * @param {number} [options.timeout] - Timeout en millisecondes
   * @returns {Promise<PaymentSession>} Session mise à jour
   */
  public async processPayment(
    session: PaymentSession,
    options?: { timeout?: number }
  ): Promise<PaymentSession> {
    try {
      const signer = await this.provider.getSigner();
      let tx: ethers.TransactionResponse;
      const feeData = await this.provider.getFeeData();

      if (session.token.address === "BNB") {
        tx = await signer.sendTransaction({
          to: session.userId,
          value: ethers.parseEther(session.amount),
          gasPrice: feeData.gasPrice, // BSC utilise un modèle de gas price simple
        });
      } else {
        const tokenContract = new ethers.Contract(
          session.token.address,
          ERC20_ABI,
          signer
        );
        const amount = ethers.parseUnits(
          session.amount,
          session.token.decimals
        );
        tx = await tokenContract.transfer(session.userId, amount, {
          gasPrice: feeData.gasPrice,
        });
      }

      const updatedSession = {
        ...session,
        status: PaymentStatus.PROCESSING,
        txHash: tx.hash,
        updatedAt: Date.now(),
      };

      // Attendre plus de confirmations sur BSC
      await tx.wait(2);

      return {
        ...updatedSession,
        status: PaymentStatus.CONFIRMED,
        updatedAt: Date.now(),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        await this.handleNetworkError(error);
      }
      return {
        ...session,
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: Date.now(),
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement
   * @public
   * @override
   * @param {string} sessionId - Identifiant de la session
   * @returns {Promise<PaymentStatus>} Statut du paiement
   */
  public async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    // Note: Cette implémentation est simplifiée
    // Dans un cas réel, il faudrait récupérer la session depuis une base de données
    return PaymentStatus.PENDING;
  }

  /**
   * Valide une transaction
   * @public
   * @override
   * @param {string} txHash - Hash de la transaction
   * @returns {Promise<boolean>} true si la transaction est valide
   */
  public async validateTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        return false;
      }

      // Vérifier le nombre de confirmations
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;
      return confirmations >= 2;
    } catch (error: unknown) {
      if (error instanceof Error) {
        await this.handleNetworkError(error);
      }
      return false;
    }
  }

  /**
   * Gère les erreurs réseau
   * @protected
   * @override
   * @param {Error} error - Erreur à traiter
   */
  protected async handleNetworkError(error: Error): Promise<void> {
    console.error("Erreur réseau BSC:", error);
    // Implémentation de la gestion des erreurs réseau
    // Par exemple: reconnexion, retry, etc.
  }

  /**
   * Vérifie si une adresse est valide
   * @public
   * @param {string} address - Adresse à vérifier
   * @returns {boolean} True si l'adresse est valide
   */
  public isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Obtient le solde d'un token pour une adresse
   * @public
   * @param {string} address - Adresse du portefeuille
   * @param {PaymentToken} token - Token à vérifier
   * @returns {Promise<string>} Solde formaté
   */
  public async getBalance(
    address: string,
    token: PaymentToken
  ): Promise<string> {
    if (!this.isValidAddress(address)) {
      throw this.createPaymentError("Adresse invalide", "INVALID_ADDRESS");
    }

    if (!this.validateToken(token)) {
      throw this.createPaymentError("Token non supporté", "INVALID_TOKEN");
    }

    if (token.address === "BNB") {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } else {
      const tokenContract = new ethers.Contract(
        token.address,
        ERC20_ABI,
        this.provider
      );
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, token.decimals);
    }
  }
}
