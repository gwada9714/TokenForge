import {
  PublicKey,
  Transaction,
  Commitment,
  SystemProgram,
  Connection,
  Keypair
} from '@solana/web3.js';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentToken, PaymentSession, PaymentStatus } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';

// Type personnalisé pour les options de transaction Solana
export interface SolanaTransactionOptions {
  skipPreflight?: boolean;
  commitment?: Commitment;
}

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
export class SolanaPaymentService implements BasePaymentService {
  private static instance: SolanaPaymentService;
  private sessionService: PaymentSessionService;
  private config: SolanaPaymentConfig;

  private constructor(config: SolanaPaymentConfig) {
    this.config = config;
    this.sessionService = PaymentSessionService.getInstance();
  }

  /**
   * Récupère l'instance unique du service de paiement Solana
   */
  public static async getInstance(config?: SolanaPaymentConfig): Promise<SolanaPaymentService> {
    if (!config) {
      throw new Error('Invalid configuration: config is required');
    }
    
    if (!config.connection || !config.wallet || !config.programId || !config.receiverAddress) {
      throw new Error('Invalid configuration: missing required fields');
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
    try {
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await this.config.connection.getLatestBlockhash(
        options.commitment || 'confirmed'
      );

      // Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: this.config.wallet.publicKey,
        toPubkey: this.config.receiverAddress,
        lamports: Number(session.amount)
      });

      // Create transaction
      const transaction = new Transaction({
        feePayer: this.config.wallet.publicKey,
        blockhash,
        lastValidBlockHeight
      }).add(transferInstruction);

      // Sign transaction
      transaction.sign(this.config.wallet);

      // Send and confirm transaction
      const signature = await this.config.connection.sendTransaction(transaction, [this.config.wallet], {
        skipPreflight: options.skipPreflight || false,
        preflightCommitment: options.commitment || 'confirmed',
        maxRetries: 3
      });

      // Wait for confirmation
      const confirmation = await this.config.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, options.commitment || 'confirmed');

      if (confirmation.value.err) {
        await this.sessionService.updateSessionStatus(session.id, PaymentStatus.FAILED, signature, confirmation.value.err.toString());
        throw new Error(confirmation.value.err.toString());
      }

      // Update session with transaction hash
      await this.sessionService.updateSessionStatus(session.id, PaymentStatus.CONFIRMED, signature);

      return signature;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
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
    try {
      // Validate amount
      const paymentAmount = typeof amount === 'number' ? BigInt(Math.floor(amount)) : amount;
      
      if (paymentAmount <= 0n) {
        throw new Error('Payment amount must be greater than 0');
      }

      // Validate token
      if (!(await this.isTokenSupported(tokenAddress))) {
        throw new Error('Token not supported');
      }

      // Create payment session
      const token: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.SOLANA,
        symbol: 'SOL', // Pour simplifier, on considère que c'est du SOL natif
        decimals: 9
      };

      const session = await this.sessionService.createSession(
        userId,
        paymentAmount,
        token,
        serviceType
      );

      // Process payment with retries
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const signature = await this.processPayment(session, options);
          
          // Update session status on success
          await this.sessionService.updateSessionStatus(
            session.id,
            PaymentStatus.CONFIRMED,
            signature
          );
          
          return signature;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error occurred');
          
          // Update session status on failure
          await this.sessionService.updateSessionStatus(
            session.id,
            PaymentStatus.FAILED,
            undefined,
            lastError.message
          );

          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            continue;
          }
        }
      }

      throw lastError || new Error('Payment failed after retries');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }

  public async isTokenSupported(tokenAddress: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.config.connection.getParsedAccountInfo(tokenAddress);
      return accountInfo?.value !== null;
    } catch (error) {
      return false;
    }
  }
}
