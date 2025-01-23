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
import { PaymentNetwork, PaymentToken, PaymentStatus } from '../payment/types/PaymentSession';
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
    const wallet = {
      publicKey: config.wallet.publicKey,
      signTransaction: async (tx: Transaction) => {
        tx.sign(config.wallet);
        return tx;
      },
      signAllTransactions: async (txs: Transaction[]) => {
        txs.forEach(tx => tx.sign(config.wallet));
        return txs;
      }
    };

    console.log('Initializing with wallet:', {
      publicKey: wallet.publicKey.toString(),
      hasSignTransaction: typeof wallet.signTransaction === 'function',
      hasSignAllTransactions: typeof wallet.signAllTransactions === 'function'
    });

    // Try both constructor and factory patterns for AnchorProvider
    let provider;
    try {
      console.log('Attempting to create AnchorProvider with constructor...');
      provider = new AnchorProvider(
        config.connection,
        wallet,
        { commitment: 'confirmed' }
      );
      console.log('AnchorProvider created successfully:', {
        hasConnection: !!provider.connection,
        hasWallet: !!provider.wallet,
        hasSendAndConfirm: typeof provider.sendAndConfirm === 'function'
      });
    } catch (error) {
      console.log('Constructor failed, trying env():', error);
      // If constructor fails, try factory pattern
      provider = AnchorProvider.env();
      console.log('AnchorProvider.env() result:', {
        hasConnection: !!provider.connection,
        hasWallet: !!provider.wallet,
        hasSendAndConfirm: typeof provider?.sendAndConfirm === 'function'
      });
    }

    if (!provider) {
      console.error('Provider is undefined or null');
      throw new Error('Failed to initialize AnchorProvider');
    }

    if (typeof provider.sendAndConfirm !== 'function') {
      console.error('Provider missing sendAndConfirm method:', provider);
      throw new Error('Failed to initialize AnchorProvider');
    }

    console.log('Final provider state:', {
      connection: !!provider.connection,
      wallet: !!provider.wallet,
      sendAndConfirm: typeof provider.sendAndConfirm
    });

    console.log('Program class:', Program);
    console.log('Program type:', typeof Program);

    const idl = require('./programs/solana_payment.json');
    console.log('IDL:', idl);
    console.log('Provider:', provider);

    this.program = new Program(
      idl,
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
      console.log('[SolanaPaymentService] Starting payWithToken:', {
        tokenAddress: tokenAddress.toString(),
        amount: amount.toString(),
        serviceType,
        userId,
        options
      });

      // Validate parameters
      console.log('[SolanaPaymentService] Validating payment parameters...');
      validatePaymentParams(tokenAddress, amount, userId);
      console.log('[SolanaPaymentService] Parameters validated successfully');

      // Create payment token object
      console.log('[SolanaPaymentService] Creating payment token object...');
      const paymentToken: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.SOLANA,
        symbol: 'USDC', // This should be fetched from token mint
        decimals: 6 // This should be fetched from token mint
      };
      console.log('[SolanaPaymentService] Payment token created:', paymentToken);

      // Create payment session with correct parameters
      const amountBigInt = BigInt(amount.toString());
      console.log('[SolanaPaymentService] Creating payment session...');
      console.log('[SolanaPaymentService] Session service state:', {
        isInitialized: !!this.sessionService,
        hasCreateSession: typeof this.sessionService?.createSession === 'function'
      });

      const session = await this.sessionService.createSession(
        userId,
        amountBigInt,
        paymentToken,
        serviceType
      );

      console.log('[SolanaPaymentService] Session created:', session);

      if (!session) {
        console.error('[SolanaPaymentService] Failed to create session');
        throw new Error('Failed to create payment session');
      }

      // Get provider and verify it exists
      console.log('[SolanaPaymentService] Getting provider...');
      const provider = this.program.provider as AnchorProvider;
      console.log('[SolanaPaymentService] Provider state:', {
        hasProvider: !!provider,
        hasSendAndConfirm: typeof provider?.sendAndConfirm === 'function',
        hasConnection: !!provider?.connection,
        hasWallet: !!provider?.wallet
      });

      if (!provider || typeof provider.sendAndConfirm !== 'function') {
        console.error('[SolanaPaymentService] Provider validation failed:', {
          provider: !!provider,
          sendAndConfirm: typeof provider?.sendAndConfirm
        });
        throw new Error('Provider not initialized or missing sendAndConfirm method');
      }

      // Create transaction
      console.log('[SolanaPaymentService] Creating transaction...');
      const transaction = new Transaction();

      // Add payment instruction
      console.log('[SolanaPaymentService] Creating payment instruction...');
      const instruction: PaymentInstruction = {
        tokenMint: new PublicKey(tokenAddress),
        amount: new BN(amount.toString()),
        sessionId: session.id
      };
      console.log('[SolanaPaymentService] Payment instruction created:', instruction);

      console.log('[SolanaPaymentService] Building program instruction...');
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
      console.log('[SolanaPaymentService] Program instruction built');

      transaction.add(ix);

      // Send transaction with proper options typing
      const txOptions: SolanaTransactionOptions = {
        skipPreflight: options?.skipPreflight,
        commitment: options?.commitment || 'confirmed'
      };

      try {
        console.debug('[SolanaPaymentService] Sending transaction with provider:', { provider });
        const signature = await provider.sendAndConfirm(
          transaction,
          [],
          txOptions
        );
        console.debug('[SolanaPaymentService] Transaction sent, got signature:', { signature });
        
        // Attendre la confirmation de la transaction
        const commitment = txOptions.commitment || 'confirmed' as Commitment;
        console.debug('[SolanaPaymentService] Confirming transaction:', { signature, commitment });
        await this.config.connection.confirmTransaction(signature, commitment);
        console.debug('[SolanaPaymentService] Transaction confirmed');

        // Update session status to CONFIRMED
        console.debug('[SolanaPaymentService] Updating session status:', { sessionId: session.id, signature });
        await this.sessionService.updateSessionStatus(
          session.id,
          PaymentStatus.CONFIRMED,
          undefined,
          signature
        );
        
        // Return the session ID
        return session.id;
      } catch (txError) {
        console.error('[SolanaPaymentService] Transaction failed:', txError);
        // Update session status to FAILED
        await this.sessionService.updateSessionStatus(
          session.id,
          PaymentStatus.FAILED,
          txError instanceof Error ? txError.message : 'Unknown error'
        );
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
