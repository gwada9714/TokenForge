import {
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { PaymentSessionService } from "../payment/PaymentSessionService";
import {
  PaymentNetwork,
  PaymentToken,
  PaymentSession,
  PaymentStatus,
} from "../payment/types/PaymentSession";
import {
  BasePaymentService,
  PaymentAmount,
  PaymentOptions,
} from "../payment/types/PaymentService";
import { SolanaTransactionOptions } from "./types";
import { AbstractChainService } from "../payment/base/AbstractChainService";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import { Program, AnchorProvider } from "@project-serum/anchor";

// Configuration requise pour le service de paiement Solana
export interface SolanaPaymentConfig {
  programId: PublicKey;
  connection: Connection;
  wallet: Keypair;
  receiverAddress: PublicKey;
}

/**
 * Service de paiement pour la blockchain Solana
 */
export class SolanaPaymentService extends AbstractChainService {
  readonly chainName = "Solana";
  readonly supportedTokens: PaymentToken[] = [
    {
      address: "native", // SOL
      symbol: "SOL",
      decimals: 9,
      network: PaymentNetwork.SOLANA,
    },
    {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
      symbol: "USDT",
      decimals: 6,
      network: PaymentNetwork.SOLANA,
    },
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      symbol: "USDC",
      decimals: 6,
      network: PaymentNetwork.SOLANA,
    },
  ];

  private static instance: SolanaPaymentService;
  private sessionService: PaymentSessionService;
  private config: SolanaPaymentConfig;
  private readonly connection: Connection;
  private readonly destinationAddress = new PublicKey(
    "TokenForgeDestinationAddressHere"
  );
  private readonly maxRetries = 3;
  private readonly defaultTimeout = 10000; // 10 secondes pour Solana
  private provider: AnchorProvider | null = null;
  private program: Program | null = null;

  private constructor(config: SolanaPaymentConfig) {
    super();
    this.config = config;
    this.sessionService = PaymentSessionService.getInstance();
    this.connection = config.connection;
  }

  /**
   * Récupère l'instance unique du service de paiement Solana
   */
  public static async getInstance(
    config?: SolanaPaymentConfig
  ): Promise<SolanaPaymentService> {
    if (!config) {
      throw new Error("Invalid configuration: config is required");
    }

    if (
      !config.connection ||
      !config.wallet ||
      !config.programId ||
      !config.receiverAddress
    ) {
      throw new Error("Invalid configuration: missing required fields");
    }

    if (!SolanaPaymentService.instance) {
      SolanaPaymentService.instance = new SolanaPaymentService(config);
    }

    return SolanaPaymentService.instance;
  }

  private async processPayment(
    session: PaymentSession,
    options: PaymentOptions & SolanaTransactionOptions = {}
  ): Promise<string> {
    let signature: string | undefined;

    try {
      // Get latest blockhash
      const blockHashResult = await this.connection.getLatestBlockhash(
        options.commitment || "confirmed"
      );

      const blockhash = blockHashResult?.blockhash;
      const lastValidBlockHeight = blockHashResult?.lastValidBlockHeight;

      if (!blockhash || typeof lastValidBlockHeight !== "number") {
        throw new Error("Invalid blockhash response");
      }

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: this.config.wallet.publicKey,
        toPubkey: this.config.receiverAddress,
        lamports: Number(session.amount),
      });

      // Create transaction
      const transaction = new Transaction({
        feePayer: this.config.wallet.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(transferInstruction);

      // Sign transaction
      transaction.sign(this.config.wallet);

      // Send transaction with options
      signature = await this.connection.sendTransaction(
        transaction,
        [this.config.wallet],
        {
          skipPreflight: options.skipPreflight,
          preflightCommitment: options.commitment,
          maxRetries: 3,
        }
      );

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        options.commitment || "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(`Payment failed: ${confirmation.value.err.toString()}`);
      }

      // Update session status to CONFIRMED
      await this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.CONFIRMED,
        signature
      );

      return signature;
    } catch (error) {
      // Update session status to FAILED
      await this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.FAILED,
        signature,
        error instanceof Error
          ? error.message
          : error?.toString() || "Unknown error occurred"
      );

      // Re-throw error with "Payment failed:" prefix if not already present
      const message =
        error instanceof Error
          ? error.message.startsWith("Payment failed:")
            ? error.message
            : `Payment failed: ${error.message}`
          : `Payment failed: ${error?.toString() || "Unknown error occurred"}`;

      throw new Error(message);
    }
  }

  public async payWithToken(
    tokenAddress: PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions & SolanaTransactionOptions = {}
  ): Promise<string> {
    let session;
    try {
      // Validate amount
      const paymentAmount =
        typeof amount === "number" ? BigInt(Math.floor(amount)) : amount;

      if (paymentAmount <= 0n) {
        throw new Error("Payment failed: Amount must be greater than 0");
      }

      // Validate token
      if (!(await this.isTokenSupported(tokenAddress))) {
        throw new Error("Payment failed: Token not supported");
      }

      // Create payment session
      const token: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.SOLANA,
        symbol: "SOL",
        decimals: 9,
      };

      session = await this.sessionService.createSession(
        userId,
        paymentAmount,
        token,
        serviceType
      );

      // Process payment and return signature
      return await this.processPayment(session, options);
    } catch (error: unknown) {
      // If we have a session, update its status
      if (session) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : error?.toString() || "Unknown error occurred";
        await this.sessionService.updateSessionStatus(
          session.id,
          PaymentStatus.FAILED,
          undefined,
          errorMessage
        );
      }

      // Re-throw the error
      if (error instanceof Error) {
        throw error; // Error should already have "Payment failed:" prefix
      }
      throw new Error("Payment failed: Unknown error occurred");
    }
  }

  public async isTokenSupported(tokenAddress: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getParsedAccountInfo(
        tokenAddress
      );
      return accountInfo?.value !== null;
    } catch (error) {
      return false;
    }
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

    // Vérifier la disponibilité du réseau Solana
    try {
      const version = await this.connection.getVersion();
      if (!version) {
        throw this.createPaymentError(
          "Réseau Solana non disponible",
          "NETWORK_ERROR"
        );
      }
    } catch (error) {
      throw this.createPaymentError(
        "Erreur de connexion Solana",
        "NETWORK_ERROR"
      );
    }

    return {
      id: `sol_${Date.now()}_${params.userId}`,
      userId: params.userId,
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.SOLANA,
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
      // Vérifier le solde avant la transaction
      await this.checkBalance(session);

      const signature = await this.sendTransaction(session);

      currentSession = {
        ...currentSession,
        status: PaymentStatus.PROCESSING,
        txHash: signature,
        updatedAt: Date.now(),
      };

      // Attendre la confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash: await (
            await this.connection.getLatestBlockhash()
          ).blockhash,
          lastValidBlockHeight: await this.connection.getBlockHeight(),
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction échouée");
      }

      return {
        ...currentSession,
        status: PaymentStatus.CONFIRMED,
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

  async validateTransaction(signature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
      });

      if (!transaction) return false;

      // Vérifier que la transaction est confirmée et réussie
      return transaction.meta?.err === null;
    } catch (error) {
      console.error("Erreur lors de la validation de la transaction:", error);
      return false;
    }
  }

  protected async handleNetworkError(error: Error): Promise<void> {
    console.error("Solana network error:", error);

    // Logique spécifique pour les erreurs Solana
    if (error.message.includes("blockhash")) {
      // Récupérer un nouveau blockhash
      await this.connection.getLatestBlockhash();
    }

    // Gérer les erreurs de nonce
    if (error.message.includes("nonce")) {
      await this.resetNonce();
    }
  }

  private async checkBalance(session: PaymentSession): Promise<void> {
    if (session.token.address === "native") {
      // Vérifier le solde SOL
      const balance = await this.connection.getBalance(this.destinationAddress);
      const amount = parseFloat(session.amount) * Math.pow(10, 9); // Convertir en lamports
      if (balance < amount) {
        throw this.createPaymentError(
          "Solde SOL insuffisant",
          "INSUFFICIENT_BALANCE"
        );
      }
    } else {
      // Vérifier le solde des tokens SPL
      const tokenPublicKey = new PublicKey(session.token.address);
      const tokenAccount = await this.connection.getTokenAccountsByOwner(
        this.destinationAddress,
        { mint: tokenPublicKey }
      );

      if (tokenAccount.value.length === 0) {
        throw this.createPaymentError(
          "Compte token non trouvé",
          "TOKEN_ACCOUNT_NOT_FOUND"
        );
      }

      const balance = await this.connection.getTokenAccountBalance(
        tokenAccount.value[0].pubkey
      );

      const amount =
        parseFloat(session.amount) * Math.pow(10, session.token.decimals);
      if (parseFloat(balance.value.amount) < amount) {
        throw this.createPaymentError(
          "Solde token insuffisant",
          "INSUFFICIENT_BALANCE"
        );
      }
    }
  }

  private async sendTransaction(session: PaymentSession): Promise<string> {
    // Logique d'envoi de transaction à implémenter
    // Pour l'instant, retourne une signature fictive
    return "SolanaTransactionSignature";
  }

  private async getSession(sessionId: string): Promise<PaymentSession | null> {
    // À implémenter avec la vraie logique de stockage
    return null;
  }

  private async resetNonce(): Promise<void> {
    // Réinitialiser le nonce en cas d'erreur
    // À implémenter
  }

  setProvider(provider: AnchorProvider) {
    this.provider = provider;
  }
}
