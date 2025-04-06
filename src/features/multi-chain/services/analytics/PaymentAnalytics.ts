import {
  PaymentNetwork,
  PaymentStatus,
  PaymentSession,
} from "../payment/types";

/**
 * Interface pour les métriques de paiement par réseau
 * @interface NetworkMetrics
 */
interface NetworkMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  averageProcessingTime: number;
}

/**
 * Interface pour le rapport d'analyse
 * @interface AnalyticsReport
 */
interface AnalyticsReport {
  networkMetrics: Record<PaymentNetwork, NetworkMetrics>;
  totalVolume: number;
  globalSuccessRate: number;
  averageProcessingTime: number;
  transactionHistory: PaymentSession[];
}

/**
 * Service d'analyse des paiements
 * Implémente le pattern Singleton pour assurer une instance unique
 * @class PaymentAnalytics
 */
export class PaymentAnalytics {
  private static instance: PaymentAnalytics;
  private networkMetrics: Record<PaymentNetwork, NetworkMetrics>;
  private transactionHistory: PaymentSession[];

  /**
   * Constructeur privé pour empêcher l'instanciation directe
   * @private
   */
  private constructor() {
    this.networkMetrics = this.initializeNetworkMetrics();
    this.transactionHistory = [];
  }

  /**
   * Obtient l'instance unique du service d'analyse
   * @public
   * @static
   * @returns {PaymentAnalytics} Instance unique du service
   */
  public static getInstance(): PaymentAnalytics {
    if (!PaymentAnalytics.instance) {
      PaymentAnalytics.instance = new PaymentAnalytics();
    }
    return PaymentAnalytics.instance;
  }

  /**
   * Initialise les métriques pour chaque réseau supporté
   * @private
   * @returns {Record<PaymentNetwork, NetworkMetrics>} Métriques initialisées
   */
  private initializeNetworkMetrics(): Record<PaymentNetwork, NetworkMetrics> {
    return {
      [PaymentNetwork.ETHEREUM]: this.createEmptyMetrics(),
      [PaymentNetwork.POLYGON]: this.createEmptyMetrics(),
      [PaymentNetwork.BSC]: this.createEmptyMetrics(),
      [PaymentNetwork.SOLANA]: this.createEmptyMetrics(),
    };
  }

  /**
   * Crée un objet de métriques vide
   * @private
   * @returns {NetworkMetrics} Métriques initialisées à zéro
   */
  private createEmptyMetrics(): NetworkMetrics {
    return {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      totalVolume: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Suit une nouvelle transaction
   * @public
   * @param {PaymentSession} session - Session de paiement à suivre
   */
  public trackTransaction(session: PaymentSession): void {
    this.transactionHistory.push(session);
    const metrics = this.networkMetrics[session.network];

    metrics.totalTransactions++;
    if (session.status === "completed") {
      metrics.successfulTransactions++;
      metrics.totalVolume += Number(session.amount);
    } else if (session.status === "failed") {
      metrics.failedTransactions++;
    }

    if (session.completedAt && session.createdAt) {
      const processingTime = session.completedAt - session.createdAt;
      metrics.averageProcessingTime =
        (metrics.averageProcessingTime * (metrics.totalTransactions - 1) +
          processingTime) /
        metrics.totalTransactions;
    }
  }

  /**
   * Filtre l'historique des transactions
   * @public
   * @param {Object} params - Paramètres de filtrage
   * @param {PaymentNetwork} [params.network] - Réseau à filtrer
   * @param {number} [params.startTime] - Timestamp de début
   * @param {number} [params.endTime] - Timestamp de fin
   * @returns {PaymentSession[]} Transactions filtrées
   */
  public filterTransactionHistory(params: {
    network?: PaymentNetwork;
    startTime?: number;
    endTime?: number;
  }): PaymentSession[] {
    return this.transactionHistory.filter((tx) => {
      if (params.network && tx.network !== params.network) return false;
      if (params.startTime && tx.createdAt < params.startTime) return false;
      if (params.endTime && tx.createdAt > params.endTime) return false;
      return true;
    });
  }

  /**
   * Génère un rapport d'analyse complet
   * @public
   * @returns {AnalyticsReport} Rapport détaillé
   */
  public generateReport(): AnalyticsReport {
    let totalVolume = 0;
    let totalSuccessful = 0;
    let totalTransactions = 0;
    let totalProcessingTime = 0;

    Object.values(this.networkMetrics).forEach((metrics) => {
      totalVolume += metrics.totalVolume;
      totalSuccessful += metrics.successfulTransactions;
      totalTransactions += metrics.totalTransactions;
      totalProcessingTime +=
        metrics.averageProcessingTime * metrics.totalTransactions;
    });

    return {
      networkMetrics: this.networkMetrics,
      totalVolume,
      globalSuccessRate:
        totalTransactions > 0 ? totalSuccessful / totalTransactions : 0,
      averageProcessingTime:
        totalTransactions > 0 ? totalProcessingTime / totalTransactions : 0,
      transactionHistory: this.transactionHistory,
    };
  }

  /**
   * Réinitialise toutes les métriques
   * @public
   */
  public resetMetrics(): void {
    this.networkMetrics = this.initializeNetworkMetrics();
    this.transactionHistory = [];
  }
}
