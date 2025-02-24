import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount
} from '@solana/spl-token';
import { AbstractChainService } from './base/AbstractChainService';
import { PaymentNetwork, PaymentSession, PaymentStatus, PaymentToken, PaymentError } from './types';

/**
 * Service de paiement pour le réseau Solana
 * Gère les paiements en SOL natif et tokens SPL
 * @class SolanaPaymentService
 * @extends AbstractChainService
 */
export class SolanaPaymentService extends AbstractChainService {
  private connection: Connection;
  private payer: Keypair;

  public readonly chainName = PaymentNetwork.SOLANA;
  public readonly supportedTokens: PaymentToken[] = [
    {
      symbol: 'SOL',
      address: 'SOL',
      decimals: 9,
      network: PaymentNetwork.SOLANA
    }
  ];

  /**
   * Crée une nouvelle instance du service de paiement Solana
   * @constructor
   * @param {string} rpcUrl - URL du nœud RPC Solana
   * @param {Uint8Array} payerPrivateKey - Clé privée du payeur
   */
  constructor(rpcUrl: string, payerPrivateKey: Uint8Array) {
    super();
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.payer = Keypair.fromSecretKey(payerPrivateKey);
  }

  /**
   * Crée une nouvelle session de paiement
   * @public
   * @override
   * @param {Object} params - Paramètres de la session
   * @param {string} params.userId - Identifiant de l'utilisateur (adresse Solana)
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
      throw this.createPaymentError('Token non supporté', 'INVALID_TOKEN');
    }

    if (!this.validateAmount(amount)) {
      throw this.createPaymentError('Montant invalide', 'INVALID_AMOUNT');
    }

    try {
      // Valider l'adresse Solana
      new PublicKey(userId);
    } catch {
      throw this.createPaymentError('Adresse Solana invalide', 'INVALID_ADDRESS');
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
      error: undefined
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
      const recipientPubkey = new PublicKey(session.userId);
      let signature: string;

      if (session.token.address === 'SOL') {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.payer.publicKey,
            toPubkey: recipientPubkey,
            lamports: Math.floor(parseFloat(session.amount) * LAMPORTS_PER_SOL)
          })
        );

        signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.payer],
          { commitment: 'confirmed' }
        );
      } else {
        const tokenMint = new PublicKey(session.token.address);
        const sourceATA = await getAssociatedTokenAddress(
          tokenMint,
          this.payer.publicKey
        );
        const destinationATA = await getAssociatedTokenAddress(
          tokenMint,
          recipientPubkey
        );

        const transaction = new Transaction().add(
          createTransferInstruction(
            sourceATA,
            destinationATA,
            this.payer.publicKey,
            Math.floor(parseFloat(session.amount) * Math.pow(10, session.token.decimals))
          )
        );

        signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.payer],
          { commitment: 'confirmed' }
        );
      }

      const updatedSession = {
        ...session,
        status: PaymentStatus.PROCESSING,
        txHash: signature,
        updatedAt: Date.now()
      };

      // Attendre la confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      return {
        ...updatedSession,
        status: PaymentStatus.CONFIRMED,
        updatedAt: Date.now()
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        await this.handleNetworkError(error);
      }
      return {
        ...session,
        status: PaymentStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: Date.now()
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
      const status = await this.connection.getSignatureStatus(txHash);
      return status?.value?.confirmationStatus === 'confirmed';
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
    console.error('Erreur réseau Solana:', error);
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
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtient le solde d'un token pour une adresse
   * @public
   * @param {string} address - Adresse du portefeuille
   * @param {PaymentToken} token - Token à vérifier
   * @returns {Promise<string>} Solde formaté
   */
  public async getBalance(address: string, token: PaymentToken): Promise<string> {
    if (!this.isValidAddress(address)) {
      throw this.createPaymentError('Adresse invalide', 'INVALID_ADDRESS');
    }

    if (!this.validateToken(token)) {
      throw this.createPaymentError('Token non supporté', 'INVALID_TOKEN');
    }

    const pubkey = new PublicKey(address);

    if (token.address === 'SOL') {
      const balance = await this.connection.getBalance(pubkey);
      return (balance / LAMPORTS_PER_SOL).toString();
    } else {
      const tokenMint = new PublicKey(token.address);
      const tokenAccount = await getAssociatedTokenAddress(tokenMint, pubkey);
      const accountInfo = await getAccount(this.connection, tokenAccount);
      return (Number(accountInfo.amount) / Math.pow(10, token.decimals)).toString();
    }
  }
}