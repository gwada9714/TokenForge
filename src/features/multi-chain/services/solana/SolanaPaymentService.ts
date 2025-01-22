import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  BN,
} from '@project-serum/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentOptions } from '../payment/types/PaymentService';

export interface SolanaPaymentConfig {
  programId: PublicKey;
  connection: Connection;
  payer: Keypair;
  receiver: PublicKey;
}

interface PaymentReceivedEvent {
  payer: PublicKey;
  token: PublicKey | null;
  amount: BN;
  serviceType: string;
  sessionId: string;
}

export class SolanaPaymentService implements BasePaymentService {
  private static instance: SolanaPaymentService;
  private program: Program;
  private sessionService: PaymentSessionService;
  private config: SolanaPaymentConfig;
  private connection: Connection;
  private paymentAccount: PublicKey = SystemProgram.programId; // Default initialization

  private constructor(config: SolanaPaymentConfig) {
    this.config = config;
    this.connection = config.connection;
    this.sessionService = PaymentSessionService.getInstance();
    this.setupProgram();
  }

  public static getInstance(config?: SolanaPaymentConfig): SolanaPaymentService {
    if (!SolanaPaymentService.instance) {
      if (!config) {
        throw new Error('Configuration required for initialization');
      }
      SolanaPaymentService.instance = new SolanaPaymentService(config);
    }
    return SolanaPaymentService.instance;
  }

  private async setupProgram() {
    // Create AnchorProvider
    const provider = new AnchorProvider(
      this.config.connection,
      {
        publicKey: this.config.payer.publicKey,
        signTransaction: async (tx: Transaction) => {
          tx.sign(this.config.payer);
          return tx;
        },
        signAllTransactions: async (txs: Transaction[]) => {
          txs.forEach(tx => tx.sign(this.config.payer));
          return txs;
        },
      },
      { commitment: 'confirmed' }
    );

    // Get program
    this.program = await Program.at(this.config.programId, provider);

    // Subscribe to program events
    this.program.addEventListener('PaymentReceived', this.handlePaymentReceived.bind(this));
  }

  private async handlePaymentReceived(event: PaymentReceivedEvent) {
    try {
      const sessionId = event.sessionId;
      this.sessionService.updateSessionStatus(
        sessionId,
        PaymentStatus.CONFIRMED,
        event.payer.toBase58()
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error handling payment received event: ${errorMessage}`);
    }
  }

  async payWithToken(
    tokenAddress: string | PublicKey,
    amount: number,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    try {
      const provider = this.program.provider as AnchorProvider;
      const payer = provider.wallet;
      const tokenMint = tokenAddress instanceof PublicKey ? tokenAddress : new PublicKey(tokenAddress);
      
      const transaction = new Transaction();
      // Add payment instruction to transaction
      const ix = await this.program.methods
        .processPayment(new BN(amount))
        .accounts({
          payer: payer.publicKey,
          tokenMint,
          systemProgram: PublicKey.default,
        })
        .instruction();

      transaction.add(ix);

      const signature = await provider.sendAndConfirm(transaction, [], {
        skipPreflight: options.skipPreflight || false,
        commitment: options.commitment || 'confirmed',
      });

      // Créer une session de paiement
      const session = {
        id: signature,
        userId,
        status: PaymentStatus.PROCESSING,
        network: PaymentNetwork.SOLANA,
        amount,
        serviceType,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
        transactionHash: signature,
      };

      await this.sessionService.createSession(session);
      return session.id;
    } catch (error) {
      console.error('Solana payment failed:', error);
      throw error;
    }
  }

  public async payWithSol(
    amount: number,
    serviceType: string,
    userId: string
  ): Promise<string> {
    try {
      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        new BN(amount),
        {
          symbol: 'SOL',
          address: SystemProgram.programId.toBase58(),
          decimals: 9,
          network: PaymentNetwork.SOLANA
        },
        serviceType as any
      );

      // Build transaction
      const tx = await this.program.methods
        .payWithSol(new BN(amount), serviceType, session.id)
        .accounts({
          paymentAccount: this.paymentAccount,
          payer: this.config.payer.publicKey,
          receiver: this.config.receiver,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      // Send transaction
      const txHash = await sendAndConfirmTransaction(
        this.config.connection,
        tx,
        [this.config.payer]
      );

      // Update session status
      this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.PROCESSING,
        txHash
      );

      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process SOL payment: ${errorMessage}`);
    }
  }

  public async getBalance(address: PublicKey): Promise<number> {
    return this.config.connection.getBalance(address);
  }

  public async getTokenBalance(
    tokenMint: PublicKey,
    owner: PublicKey
  ): Promise<number> {
    const ata = await getAssociatedTokenAddress(tokenMint, owner);
    const balance = await this.config.connection.getTokenAccountBalance(ata);
    return balance.value.uiAmount || 0;
  }

  public cleanup(): void {
    this.program.removeEventListener('PaymentReceived');
  }
}
