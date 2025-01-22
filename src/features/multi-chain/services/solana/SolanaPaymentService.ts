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
  Transaction
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

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
  private paymentAccount: PublicKey;

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

    // Initialize payment account
    this.paymentAccount = PublicKey.findProgramAddressSync(
      [Buffer.from('payment'), config.wallet.publicKey.toBuffer()],
      config.programId
    )[0];
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

  public async payWithToken(
    tokenAddress: string | PublicKey,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    validatePaymentParams(amount, options);

    try {
      const tokenMint = tokenAddress instanceof PublicKey ? 
        tokenAddress : 
        new PublicKey(tokenAddress);

      // Verify token is supported
      const isSupported = await this.isTokenSupported(tokenMint);
      if (!isSupported) {
        throw new Error('Token not supported');
      }

      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        PaymentNetwork.SOLANA,
        {
          address: tokenMint.toString(),
          amount: typeof amount === 'number' ? amount : parseFloat(amount.toString()),
          serviceType
        }
      );

      // Get associated token accounts
      const payerATA = await getAssociatedTokenAddress(
        tokenMint,
        this.config.wallet.publicKey
      );

      const receiverATA = await getAssociatedTokenAddress(
        tokenMint,
        this.config.receiverAddress
      );

      // Create payment instruction
      const ix = await this.program.methods
        .processPayment(
          new BN(typeof amount === 'number' ? amount : amount.toString()),
          session.id
        )
        .accounts({
          payer: this.config.wallet.publicKey,
          receiver: this.config.receiverAddress,
          payerTokenAccount: payerATA,
          receiverTokenAccount: receiverATA,
          tokenMint,
          paymentAccount: this.paymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .instruction();

      // Build and send transaction
      const tx = new Transaction().add(ix);
      const signature = await this.config.connection.sendTransaction(
        tx,
        [this.config.wallet],
        {
          skipPreflight: options.skipPreflight,
          commitment: options.commitment || 'confirmed'
        }
      );

      await this.config.connection.confirmTransaction(signature);
      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Payment failed: ${errorMessage}`);
      throw error;
    }
  }

  public async isTokenSupported(tokenAddress: string | PublicKey): Promise<boolean> {
    try {
      const tokenMint = tokenAddress instanceof PublicKey ? 
        tokenAddress : 
        new PublicKey(tokenAddress);

      // Vérifier si le token existe et est un SPL Token valide
      const tokenInfo = await this.config.connection.getParsedAccountInfo(tokenMint);
      return tokenInfo.value !== null && tokenInfo.value.data !== null;
    } catch (error) {
      console.error(`Error checking token support: ${error}`);
      return false;
    }
  }
}
