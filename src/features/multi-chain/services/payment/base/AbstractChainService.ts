import {
  PaymentSession,
  PaymentStatus,
  PaymentToken,
  PaymentError,
} from "../types";

/**
 * Service de base abstrait pour les paiements sur différentes blockchains
 * @abstract
 * @class AbstractChainService
 */
export abstract class AbstractChainService {
  /**
   * Nom de la blockchain
   * @abstract
   * @readonly
   * @type {string}
   */
  abstract readonly chainName: string;

  /**
   * Liste des tokens supportés sur cette blockchain
   * @abstract
   * @readonly
   * @type {PaymentToken[]}
   */
  abstract readonly supportedTokens: PaymentToken[];

  /**
   * Crée une nouvelle session de paiement
   * @abstract
   * @param {Object} params - Paramètres de la session
   * @param {string} params.userId - Identifiant de l'utilisateur
   * @param {PaymentToken} params.token - Token utilisé pour le paiement
   * @param {string} params.amount - Montant du paiement
   * @returns {Promise<PaymentSession>} Session de paiement créée
   * @throws {PaymentError} Si les paramètres sont invalides
   */
  abstract createPaymentSession(params: {
    userId: string;
    token: PaymentToken;
    amount: string;
  }): Promise<PaymentSession>;

  /**
   * Traite un paiement
   * @abstract
   * @param {PaymentSession} session - Session de paiement à traiter
   * @param {Object} [options] - Options de traitement
   * @param {number} [options.timeout] - Timeout en millisecondes
   * @returns {Promise<PaymentSession>} Session mise à jour
   */
  abstract processPayment(
    session: PaymentSession,
    options?: { timeout?: number }
  ): Promise<PaymentSession>;

  /**
   * Récupère le statut d'un paiement
   * @abstract
   * @param {string} sessionId - Identifiant de la session
   * @returns {Promise<PaymentStatus>} Statut du paiement
   * @throws {PaymentError} Si la session n'existe pas
   */
  abstract getPaymentStatus(sessionId: string): Promise<PaymentStatus>;

  /**
   * Valide une transaction
   * @abstract
   * @param {string} txHash - Hash de la transaction
   * @returns {Promise<boolean>} true si la transaction est valide
   */
  abstract validateTransaction(txHash: string): Promise<boolean>;

  /**
   * Gère les erreurs réseau
   * @abstract
   * @protected
   * @param {Error} error - Erreur à traiter
   * @returns {Promise<void>}
   */
  protected abstract handleNetworkError(error: Error): Promise<void>;

  /**
   * Valide un montant
   * @protected
   * @param {string} amount - Montant à valider
   * @returns {boolean} true si le montant est valide
   */
  protected validateAmount(amount: string): boolean {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }

  /**
   * Valide un token
   * @protected
   * @param {PaymentToken} token - Token à valider
   * @returns {boolean} true si le token est supporté
   */
  protected validateToken(token: PaymentToken): boolean {
    return this.supportedTokens.some(
      (t) => t.address.toLowerCase() === token.address.toLowerCase()
    );
  }

  /**
   * Crée une erreur de paiement
   * @protected
   * @param {string} message - Message d'erreur
   * @param {string} code - Code d'erreur
   * @returns {PaymentError} Erreur de paiement
   */
  protected createPaymentError(message: string, code: string): PaymentError {
    return {
      message,
      code,
      name: "PaymentError",
    } as PaymentError;
  }
}
