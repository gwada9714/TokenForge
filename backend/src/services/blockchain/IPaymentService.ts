import { 
  PaymentStatus, 
  CryptocurrencyInfo, 
  FeeEstimate, 
  CryptoAmount, 
  PaymentInitParams, 
  PaymentSession 
} from '../../types/payment';

/**
 * Interface pour les services de paiement blockchain
 * Définit les méthodes communes à tous les services de paiement
 */
export interface IPaymentService {
  /**
   * Méthode pour initialiser une session de paiement
   * @param params Paramètres d'initialisation du paiement
   * @returns Session de paiement
   */
  initPaymentSession(params: PaymentInitParams): Promise<PaymentSession>;
  
  /**
   * Méthode pour vérifier l'état d'un paiement
   * @param sessionId Identifiant de la session
   * @returns Statut du paiement
   */
  checkPaymentStatus(sessionId: string): Promise<PaymentStatus>;
  
  /**
   * Méthode pour confirmer la réception d'un paiement
   * @param sessionId Identifiant de la session
   * @param txHash Hash de la transaction
   * @returns true si le paiement est confirmé, false sinon
   */
  confirmPayment(sessionId: string, txHash: string): Promise<boolean>;
  
  /**
   * Méthode pour obtenir les cryptomonnaies supportées
   * @returns Liste des cryptomonnaies supportées
   */
  getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]>;
  
  /**
   * Méthode pour obtenir les frais de transaction estimés
   * @param amount Montant en EUR
   * @param currencyAddress Adresse du token (null pour crypto native)
   * @returns Estimation des frais
   */
  estimateTransactionFees(amount: number, currencyAddress: string | null): Promise<FeeEstimate>;
  
  /**
   * Méthode pour convertir EUR en crypto
   * @param amountEUR Montant en EUR
   * @param currencySymbol Symbole de la cryptomonnaie
   * @returns Montant converti en crypto
   */
  convertEURtoCrypto(amountEUR: number, currencySymbol: string): Promise<CryptoAmount>;
}
