import {
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
  Keypair
} from '@solana/web3.js';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentToken, PaymentSession, PaymentStatus } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { SolanaTransactionOptions } from './types';

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
    let signature: string | undefined;
    
    try {
      // Get latest blockhash
      const blockHashResult = await this.config.connection.getLatestBlockhash(
        options.commitment || 'confirmed'
      );
      
      const blockhash = blockHashResult?.blockhash;
      const lastValidBlockHeight = blockHashResult?.lastValidBlockHeight;

      if (!blockhash || typeof lastValidBlockHeight !== 'number') {
        throw new Error('Invalid blockhash response');
      }

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

      // Send transaction with options
      signature = await this.config.connection.sendTransaction(transaction, [this.config.wallet], {
        skipPreflight: options.skipPreflight,
        preflightCommitment: options.commitment,
        maxRetries: 3
      });

      // Wait for confirmation
      const confirmation = await this.config.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, options.commitment || 'confirmed');

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
        error instanceof Error ? error.message : error?.toString() || 'Unknown error occurred'
      );

      // Re-throw error with "Payment failed:" prefix if not already present
      const message = error instanceof Error
        ? error.message.startsWith('Payment failed:') 
          ? error.message 
          : `Payment failed: ${error.message}`
        : `Payment failed: ${error?.toString() || 'Unknown error occurred'}`;
      
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
      const paymentAmount = typeof amount === 'number' ? BigInt(Math.floor(amount)) : amount;
      
      if (paymentAmount <= 0n) {
        throw new Error('Payment failed: Amount must be greater than 0');
      }

      // Validate token
      if (!(await this.isTokenSupported(tokenAddress))) {
        throw new Error('Payment failed: Token not supported');
      }

      // Create payment session
      const token: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.SOLANA,
        symbol: 'SOL',
        decimals: 9
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
        const errorMessage = error instanceof Error ? error.message : error?.toString() || 'Unknown error occurred';
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
      throw new Error('Payment failed: Unknown error occurred');
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
