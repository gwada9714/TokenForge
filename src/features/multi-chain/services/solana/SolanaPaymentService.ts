import {
  Program,
  AnchorProvider,
  web3,
  BN
} from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  Commitment
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentToken } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

// Type personnalisé pour les options de transaction Solana
type SolanaTransactionOptions = {
  skipPreflight?: boolean;
  commitment?: Commitment;
};

export interface SolanaPaymentConfig {
  programId: PublicKey;
  connection: web3.Connection;
  wallet: web3.Keypair;
  receiverAddress: PublicKey;
}

export interface PaymentInstruction {
  tokenMint: PublicKey;
  amount: BN;
  sessionId: string;
}

export class SolanaPaymentService implements BasePaymentService {
  private static instance: SolanaPaymentService;
  private program: Program;
  private sessionService: PaymentSessionService;
  private config: SolanaPaymentConfig;

  private constructor(config: SolanaPaymentConfig) {
    this.config = config;
    this.sessionService = PaymentSessionService.getInstance();
    
    // Initialize program
    const provider = new AnchorProvider(
      config.connection,
      {
        publicKey: config.wallet.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(config.wallet);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          txs.forEach(tx => tx.sign(config.wallet));
          return txs;
        }
      },
      { commitment: 'confirmed' }
    );

    this.program = new Program(
      require('./programs/solana_payment.json'),
      config.programId,
      provider
    );
  }

  public static getInstance(config?: SolanaPaymentConfig): SolanaPaymentService {
    if (!SolanaPaymentService.instance && config) {
      SolanaPaymentService.instance = new SolanaPaymentService(config);
    }
    return SolanaPaymentService.instance;
  }

  public async payWithToken(
    tokenAddress: PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    try {
      // Validate parameters
      validatePaymentParams(tokenAddress, amount, userId);

      // Create payment token object
      const paymentToken: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.SOLANA,
        symbol: 'SOL', // This should be fetched from token mint
        decimals: 9 // This should be fetched from token mint
      };

      // Create payment session with correct parameters
      const amountBigInt = BigInt(amount.toString());
      const session = this.sessionService.createSession(
        userId,
        amountBigInt,
        paymentToken,
        serviceType
      );

      if (!session) {
        throw new Error('Failed to create payment session');
      }

      // Get provider
      const provider = this.program.provider as AnchorProvider;
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      // Create transaction
      const transaction = new Transaction();

      // Add payment instruction
      const instruction: PaymentInstruction = {
        tokenMint: new PublicKey(tokenAddress),
        amount: new BN(amount.toString()),
        sessionId: session.id
      };

      const ix = await this.program.methods
        .processPayment(instruction)
        .accounts({
          payer: this.config.wallet.publicKey,
          receiver: this.config.receiverAddress,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      transaction.add(ix);

      // Send transaction with proper options typing
      const txOptions: SolanaTransactionOptions = {
        skipPreflight: options?.skipPreflight,
        commitment: options?.commitment || 'confirmed'
      };

      try {
        // Use provider's sendAndConfirm method
        const signature = await provider.sendAndConfirm(
          transaction,
          [],
          txOptions
        );
        
        // Attendre la confirmation de la transaction
        const commitment = txOptions.commitment || 'confirmed' as Commitment;
        await this.config.connection.confirmTransaction(signature, commitment);
      } catch (txError) {
        throw new Error(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`);
      }

      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }

  public async isTokenSupported(tokenAddress: PublicKey): Promise<boolean> {
    try {
      const mint = new PublicKey(tokenAddress);
      const info = await this.config.connection.getParsedAccountInfo(mint);
      return info !== null;
    } catch {
      return false;
    }
  }
}
