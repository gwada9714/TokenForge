import { IPaymentService } from './blockchain/IPaymentService';
import { EthereumPaymentService } from './blockchain/EthereumPaymentService';
import { BSCPaymentService } from './blockchain/BSCPaymentService';
import { PolygonPaymentService } from './blockchain/PolygonPaymentService';
import { AvalanchePaymentService } from './blockchain/AvalanchePaymentService';
import { SolanaPaymentService } from './blockchain/SolanaPaymentService';
import { ArbitrumPaymentService } from './blockchain/ArbitrumPaymentService';
import { 
  PaymentStatus, 
  CryptocurrencyInfo, 
  FeeEstimate, 
  CryptoAmount, 
  PaymentInitParams, 
  PaymentSession 
} from '../types/payment';

/**
 * Service de gestion des sessions de paiement
 * Centralise les interactions avec les différents services de paiement blockchain
 */
class PaymentSessionService {
  private paymentServices: Record<string, IPaymentService> = {};
  
  constructor() {
    // Initialiser les services de paiement pour chaque blockchain
    this.paymentServices = {
      'ethereum': new EthereumPaymentService(),
      'binance': new BSCPaymentService(),
      'polygon': new PolygonPaymentService(),
      'avalanche': new AvalanchePaymentService(),
      'solana': new SolanaPaymentService(),
      'arbitrum': new ArbitrumPaymentService()
    };
  }
  
  /**
   * Récupère le service de paiement pour une blockchain donnée
   * @param network Nom de la blockchain
   * @returns Service de paiement
   */
  getPaymentService(network: string): IPaymentService {
    const service = this.paymentServices[network.toLowerCase()];
    
    if (!service) {
      throw new Error(`Unsupported blockchain network: ${network}`);
    }
    
    return service;
  }
  
  /**
   * Crée une session de paiement
   * @param network Nom de la blockchain
   * @param params Paramètres d'initialisation
   * @returns Session de paiement
   */
  async createPaymentSession(network: string, params: PaymentInitParams): Promise<PaymentSession> {
    const paymentService = this.getPaymentService(network);
    return paymentService.initPaymentSession(params);
  }
  
  /**
   * Vérifie le statut d'une session de paiement
   * @param sessionId Identifiant de la session
   * @returns Statut du paiement
   */
  async checkPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    // Dans une implémentation réelle, on récupérerait d'abord la session
    // pour déterminer quelle blockchain utiliser
    // Pour la démo, on utilise Ethereum par défaut
    const paymentService = this.paymentServices['ethereum'];
    return paymentService.checkPaymentStatus(sessionId);
  }
  
  /**
   * Confirme un paiement
   * @param sessionId Identifiant de la session
   * @param txHash Hash de la transaction
   * @returns true si le paiement est confirmé, false sinon
   */
  async confirmPayment(sessionId: string, txHash: string): Promise<boolean> {
    // Dans une implémentation réelle, on récupérerait d'abord la session
    // pour déterminer quelle blockchain utiliser
    // Pour la démo, on utilise Ethereum par défaut
    const paymentService = this.paymentServices['ethereum'];
    return paymentService.confirmPayment(sessionId, txHash);
  }
  
  /**
   * Récupère les cryptomonnaies supportées pour une blockchain
   * @param network Nom de la blockchain
   * @returns Liste des cryptomonnaies supportées
   */
  async getSupportedCryptocurrencies(network: string): Promise<CryptocurrencyInfo[]> {
    const paymentService = this.getPaymentService(network);
    return paymentService.getSupportedCryptocurrencies();
  }
  
  /**
   * Estime les frais de transaction
   * @param network Nom de la blockchain
   * @param amount Montant en EUR
   * @param currencyAddress Adresse du token (null pour crypto native)
   * @returns Estimation des frais
   */
  async estimateTransactionFees(
    network: string,
    amount: number,
    currencyAddress: string | null
  ): Promise<FeeEstimate> {
    const paymentService = this.getPaymentService(network);
    return paymentService.estimateTransactionFees(amount, currencyAddress);
  }
  
  /**
   * Convertit un montant EUR en crypto
   * @param network Nom de la blockchain
   * @param amountEUR Montant en EUR
   * @param currencySymbol Symbole de la cryptomonnaie
   * @returns Montant converti en crypto
   */
  async convertEURtoCrypto(
    network: string,
    amountEUR: number,
    currencySymbol: string
  ): Promise<CryptoAmount> {
    const paymentService = this.getPaymentService(network);
    return paymentService.convertEURtoCrypto(amountEUR, currencySymbol);
  }
  
  /**
   * Récupère les transactions d'un utilisateur
   * @param userId Identifiant de l'utilisateur
   * @returns Liste des transactions
   */
  async getUserTransactions(userId: string): Promise<any[]> {
    // Dans une implémentation réelle, on récupérerait les transactions depuis Firebase
    // Pour la démo, on retourne un tableau vide
    return [];
  }
}

module.exports = PaymentSessionService;
