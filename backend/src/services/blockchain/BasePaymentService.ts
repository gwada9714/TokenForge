import { v4 as uuidv4 } from "uuid";
import { IPaymentService } from "./IPaymentService";
import {
  PaymentStatus,
  CryptocurrencyInfo,
  FeeEstimate,
  CryptoAmount,
  PaymentInitParams,
  PaymentSession,
} from "../../types/payment";
const PriceOracleService = require("../PriceOracleService");

/**
 * Classe de base pour les services de paiement blockchain
 * Implémente les fonctionnalités communes à tous les services
 */
export abstract class BasePaymentService implements IPaymentService {
  protected receivingAddress: string = "0x92e92b2705edc3d4c7204f961cc659c0";
  protected priceOracle: any;
  protected chainId: number;
  protected networkName: string;

  // Liste des cryptomonnaies supportées
  protected supportedCrypto: Record<string, CryptocurrencyInfo> = {};

  /**
   * Constructeur
   * @param networkName Nom du réseau
   * @param chainId ID de la chaîne
   */
  constructor(networkName: string, chainId: number) {
    this.networkName = networkName;
    this.chainId = chainId;
    this.priceOracle = new PriceOracleService();

    // Initialiser les cryptos supportées
    this.initSupportedCryptocurrencies();
  }

  /**
   * Initialise les cryptomonnaies supportées
   * À implémenter dans les classes dérivées
   */
  protected abstract initSupportedCryptocurrencies(): void;

  /**
   * Récupère le symbole de la crypto native
   * @returns Symbole de la crypto native
   */
  protected abstract getNativeSymbol(): string;

  /**
   * Initialise une session de paiement
   * @param params Paramètres d'initialisation du paiement
   * @returns Session de paiement
   */
  async initPaymentSession(params: PaymentInitParams): Promise<PaymentSession> {
    // Vérifier que la crypto est supportée
    const currency = this.supportedCrypto[params.currency];
    if (!currency) {
      throw new Error(
        `Cryptocurrency ${params.currency} not supported on ${this.networkName}`
      );
    }

    // Convertir le montant EUR en crypto
    const cryptoAmount = await this.convertEURtoCrypto(
      params.amount,
      params.currency
    );

    // Générer un ID de session unique
    const sessionId = uuidv4();

    // Créer la session de paiement
    const session: PaymentSession = {
      sessionId,
      receivingAddress: this.receivingAddress,
      amountDue: cryptoAmount,
      currency,
      exchangeRate: cryptoAmount.valueEUR / params.amount,
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
      chainId: this.chainId,
      status: PaymentStatus.PENDING,
      minConfirmations: this.getMinConfirmations(),
    };

    // Enregistrer la session dans la base de données
    await this.savePaymentSession(session, params);

    return session;
  }

  /**
   * Vérifie le statut d'un paiement
   * @param sessionId Identifiant de la session
   * @returns Statut du paiement
   */
  async checkPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    // Récupérer la session depuis la base de données
    const session = await this.getPaymentSession(sessionId);

    if (!session) {
      throw new Error("Payment session not found");
    }

    // Si déjà complété ou expiré, retourner le statut actuel
    if (
      session.status === PaymentStatus.COMPLETED ||
      session.status === PaymentStatus.EXPIRED ||
      session.status === PaymentStatus.FAILED
    ) {
      return session.status;
    }

    // Vérifier si la session a expiré
    if (session.expiresAt < Math.floor(Date.now() / 1000)) {
      await this.updatePaymentStatus(sessionId, PaymentStatus.EXPIRED);
      return PaymentStatus.EXPIRED;
    }

    // Si un hash de transaction existe, vérifier les confirmations
    const txHash = await this.getTransactionHash(sessionId);
    if (txHash) {
      try {
        // Dans une implémentation réelle, on vérifierait les confirmations
        // Pour la démo, on simule une confirmation après 30 secondes
        const session = await this.getPaymentSession(sessionId);
        const createdAt = session?.expiresAt ? session.expiresAt - 3600 : 0; // Estimation de la date de création
        const now = Math.floor(Date.now() / 1000);

        if (now - createdAt > 30) {
          await this.updatePaymentStatus(sessionId, PaymentStatus.COMPLETED);
          return PaymentStatus.COMPLETED;
        } else {
          return PaymentStatus.CONFIRMING;
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        return session.status;
      }
    }

    return session.status;
  }

  /**
   * Confirme un paiement
   * @param sessionId Identifiant de la session
   * @param txHash Hash de la transaction
   * @returns true si le paiement est confirmé, false sinon
   */
  async confirmPayment(sessionId: string, txHash: string): Promise<boolean> {
    // Récupérer la session
    const session = await this.getPaymentSession(sessionId);

    if (!session) {
      throw new Error("Payment session not found");
    }

    try {
      // Dans une implémentation réelle, on vérifierait la transaction
      // Pour la démo, on simule une confirmation réussie

      // Mettre à jour la session
      await this.updatePaymentStatus(sessionId, PaymentStatus.CONFIRMING);
      await this.saveTransactionHash(sessionId, txHash);

      return true;
    } catch (error) {
      console.error("Error confirming payment:", error);

      // Mettre à jour la session avec l'erreur
      await this.updatePaymentStatus(sessionId, PaymentStatus.FAILED);
      await this.savePaymentError(
        sessionId,
        error instanceof Error ? error.message : String(error)
      );

      return false;
    }
  }

  /**
   * Récupère les cryptomonnaies supportées
   * @returns Liste des cryptomonnaies supportées
   */
  async getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]> {
    return Object.values(this.supportedCrypto);
  }

  /**
   * Estime les frais de transaction
   * @param amount Montant en EUR
   * @param currencyAddress Adresse du token (null pour crypto native)
   * @returns Estimation des frais
   */
  async estimateTransactionFees(
    amount: number,
    currencyAddress: string | null
  ): Promise<FeeEstimate> {
    try {
      // Dans une implémentation réelle, on estimerait les frais
      // Pour la démo, on retourne des valeurs fixes

      // Récupérer le symbole de la crypto native
      const nativeSymbol = this.getNativeSymbol();

      // Convertir en valeur EUR pour l'affichage
      const nativePriceEUR = await this.priceOracle.getCryptoPrice(
        nativeSymbol,
        "EUR"
      );

      // Estimer les frais (plus élevés pour les tokens)
      const baseFeeNative = currencyAddress === null ? 0.001 : 0.003;
      const maxFeeNative = baseFeeNative * 1.2;

      return {
        baseFee: {
          amount: "0",
          formatted: `${baseFeeNative.toFixed(6)} ${nativeSymbol}`,
          valueEUR: baseFeeNative * nativePriceEUR,
        },
        maxFee: {
          amount: "0",
          formatted: `${maxFeeNative.toFixed(6)} ${nativeSymbol}`,
          valueEUR: maxFeeNative * nativePriceEUR,
        },
        estimatedTimeSeconds: this.getEstimatedTransactionTime(),
      };
    } catch (error) {
      console.error("Error estimating fees:", error);

      // Valeurs par défaut en cas d'erreur
      const nativeSymbol = this.getNativeSymbol();
      return {
        baseFee: {
          amount: "0",
          formatted: `0.001 ${nativeSymbol}`,
          valueEUR: 0.5,
        },
        maxFee: {
          amount: "0",
          formatted: `0.0015 ${nativeSymbol}`,
          valueEUR: 0.75,
        },
        estimatedTimeSeconds: 60,
      };
    }
  }

  /**
   * Convertit un montant EUR en crypto
   * @param amountEUR Montant en EUR
   * @param currencySymbol Symbole de la cryptomonnaie
   * @returns Montant converti en crypto
   */
  async convertEURtoCrypto(
    amountEUR: number,
    currencySymbol: string
  ): Promise<CryptoAmount> {
    try {
      const currency = this.supportedCrypto[currencySymbol];

      if (!currency) {
        throw new Error(
          `Currency ${currencySymbol} not supported on ${this.networkName}`
        );
      }

      if (currency.isStablecoin) {
        // Pour les stablecoins, on considère 1 USD ≈ 1 stablecoin
        // avec un taux de conversion EUR/USD
        const eurUsdRate = await this.priceOracle.getEURUSDRate();
        const stablecoinAmount = amountEUR * eurUsdRate;

        // Ajouter une marge de sécurité de 2%
        const adjustedAmount = stablecoinAmount * 1.02;

        return {
          amount: Math.floor(
            adjustedAmount * Math.pow(10, currency.decimals)
          ).toString(),
          formatted: `${adjustedAmount.toFixed(2)} ${currency.symbol}`,
          valueEUR: amountEUR,
        };
      } else {
        // Pour les cryptos natives, obtenir le prix actuel
        const cryptoPriceEUR = await this.priceOracle.getCryptoPrice(
          currencySymbol,
          "EUR"
        );

        // Calculer le montant en crypto
        const cryptoAmount = amountEUR / cryptoPriceEUR;

        // Ajouter une marge de sécurité de 5% pour la volatilité
        const adjustedAmount = cryptoAmount * 1.05;

        return {
          amount: Math.floor(
            adjustedAmount * Math.pow(10, currency.decimals)
          ).toString(),
          formatted: `${adjustedAmount.toFixed(6)} ${currency.symbol}`,
          valueEUR: amountEUR,
        };
      }
    } catch (error) {
      console.error("Error converting EUR to crypto:", error);
      throw new Error(
        `Failed to convert EUR to ${currencySymbol}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Par défaut, 3 confirmations
    return 3;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Par défaut, 30 secondes
    return 30;
  }

  /**
   * Enregistre une session de paiement dans la base de données
   * @param session Session de paiement
   * @param params Paramètres d'initialisation
   */
  protected async savePaymentSession(
    session: PaymentSession,
    params: PaymentInitParams
  ): Promise<void> {
    // Dans une implémentation réelle, on enregistrerait dans Firebase
    console.log(
      `Saving payment session ${session.sessionId} for ${this.networkName}`
    );

    // Simuler un enregistrement réussi
    return Promise.resolve();
  }

  /**
   * Récupère une session de paiement depuis la base de données
   * @param sessionId Identifiant de la session
   * @returns Session de paiement ou null si non trouvée
   */
  protected async getPaymentSession(
    sessionId: string
  ): Promise<PaymentSession | null> {
    // Dans une implémentation réelle, on récupérerait depuis Firebase
    console.log(`Getting payment session ${sessionId} for ${this.networkName}`);

    // Simuler une session
    return {
      sessionId,
      receivingAddress: this.receivingAddress,
      amountDue: {
        amount: "1000000000000000000",
        formatted: "1.0 ETH",
        valueEUR: 2000,
      },
      currency: this.supportedCrypto[this.getNativeSymbol()],
      exchangeRate: 2000,
      expiresAt: Math.floor(Date.now() / 1000) + 1800, // Expire dans 30 minutes
      chainId: this.chainId,
      status: PaymentStatus.PENDING,
      minConfirmations: this.getMinConfirmations(),
    };
  }

  /**
   * Met à jour le statut d'une session de paiement
   * @param sessionId Identifiant de la session
   * @param status Nouveau statut
   */
  protected async updatePaymentStatus(
    sessionId: string,
    status: PaymentStatus
  ): Promise<void> {
    // Dans une implémentation réelle, on mettrait à jour dans Firebase
    console.log(
      `Updating payment session ${sessionId} status to ${status} for ${this.networkName}`
    );

    // Simuler une mise à jour réussie
    return Promise.resolve();
  }

  /**
   * Enregistre le hash de transaction pour une session
   * @param sessionId Identifiant de la session
   * @param txHash Hash de la transaction
   */
  protected async saveTransactionHash(
    sessionId: string,
    txHash: string
  ): Promise<void> {
    // Dans une implémentation réelle, on enregistrerait dans Firebase
    console.log(
      `Saving transaction hash ${txHash} for session ${sessionId} on ${this.networkName}`
    );

    // Simuler un enregistrement réussi
    return Promise.resolve();
  }

  /**
   * Récupère le hash de transaction pour une session
   * @param sessionId Identifiant de la session
   * @returns Hash de la transaction ou null si non trouvé
   */
  protected async getTransactionHash(
    sessionId: string
  ): Promise<string | null> {
    // Dans une implémentation réelle, on récupérerait depuis Firebase
    console.log(
      `Getting transaction hash for session ${sessionId} on ${this.networkName}`
    );

    // Simuler un hash
    return null;
  }

  /**
   * Enregistre une erreur de paiement
   * @param sessionId Identifiant de la session
   * @param error Message d'erreur
   */
  protected async savePaymentError(
    sessionId: string,
    error: string
  ): Promise<void> {
    // Dans une implémentation réelle, on enregistrerait dans Firebase
    console.log(
      `Saving payment error for session ${sessionId} on ${this.networkName}: ${error}`
    );

    // Simuler un enregistrement réussi
    return Promise.resolve();
  }
}
