import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PaymentAnalytics } from "@/features/multi-chain/services/analytics/PaymentAnalytics";
import {
  PaymentNetwork,
  PaymentStatus,
  PaymentSession,
} from "@/features/multi-chain/services/payment/types";

describe("PaymentAnalytics", () => {
  let analytics: PaymentAnalytics;
  let mockSession: PaymentSession;

  beforeEach(() => {
    analytics = PaymentAnalytics.getInstance();
    mockSession = {
      id: "test-session-1",
      userId: "test-user",
      status: PaymentStatus.CONFIRMED,
      network: PaymentNetwork.ETHEREUM,
      token: {
        address: "0x1234",
        symbol: "TEST",
        decimals: 18,
        network: PaymentNetwork.ETHEREUM,
      },
      amount: "1.5",
      createdAt: Date.now() - 1000, // 1 seconde plus tôt
      updatedAt: Date.now(),
      retryCount: 1,
    };
  });

  afterEach(() => {
    analytics.clearMetrics();
  });

  describe("Tracking des Transactions", () => {
    it("devrait tracker une nouvelle transaction", () => {
      analytics.trackTransaction(mockSession);

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics).toBeDefined();
      expect(metrics?.totalTransactions).toBe(1);
      expect(metrics?.successfulTransactions).toBe(1);
      expect(metrics?.failedTransactions).toBe(0);
    });

    it("devrait calculer correctement les métriques pour plusieurs transactions", () => {
      // Transaction réussie
      analytics.trackTransaction(mockSession);

      // Transaction échouée
      analytics.trackTransaction({
        ...mockSession,
        status: PaymentStatus.FAILED,
        id: "test-session-2",
      });

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics?.totalTransactions).toBe(2);
      expect(metrics?.successfulTransactions).toBe(1);
      expect(metrics?.failedTransactions).toBe(1);
    });

    it("devrait calculer correctement le taux de retry", () => {
      analytics.trackTransaction(mockSession); // 1 retry
      analytics.trackTransaction({
        ...mockSession,
        id: "test-session-2",
        retryCount: 2,
      }); // 2 retries

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics?.retryRate).toBe(1.5); // (1 + 2) / 2 transactions
    });
  });

  describe("Filtrage et Rapports", () => {
    it("devrait filtrer l'historique des transactions par réseau", () => {
      analytics.trackTransaction(mockSession); // Ethereum
      analytics.trackTransaction({
        ...mockSession,
        id: "test-session-2",
        network: PaymentNetwork.POLYGON,
      }); // Polygon

      const ethTransactions = analytics.getTransactionHistory(
        PaymentNetwork.ETHEREUM
      );
      expect(ethTransactions.length).toBe(1);
      expect(ethTransactions[0].network).toBe(PaymentNetwork.ETHEREUM);
    });

    it("devrait filtrer l'historique par période", () => {
      const now = Date.now();
      const hourAgo = now - 3600000;

      analytics.trackTransaction({
        ...mockSession,
        createdAt: hourAgo,
        updatedAt: hourAgo + 1000,
      });
      analytics.trackTransaction(mockSession);

      const recentTransactions = analytics.getTransactionHistory(
        undefined,
        now - 1800000 // 30 minutes ago
      );
      expect(recentTransactions.length).toBe(1);
    });

    it("devrait générer un rapport complet", () => {
      analytics.trackTransaction(mockSession);
      const report = JSON.parse(
        analytics.generateReport(PaymentNetwork.ETHEREUM)
      );

      expect(report).toHaveProperty("timestamp");
      expect(report).toHaveProperty("metrics");
      expect(report).toHaveProperty("recentTransactions");
      expect(report.metrics[PaymentNetwork.ETHEREUM].totalTransactions).toBe(1);
    });
  });

  describe("Gestion des Métriques", () => {
    it("devrait calculer correctement le volume total", () => {
      analytics.trackTransaction(mockSession); // 1.5
      analytics.trackTransaction({
        ...mockSession,
        id: "test-session-2",
        amount: "2.5",
      }); // +2.5

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics?.totalVolume).toBe("4"); // 1.5 + 2.5
    });

    it("devrait calculer correctement le temps de traitement moyen", () => {
      analytics.trackTransaction(mockSession); // 1000ms
      analytics.trackTransaction({
        ...mockSession,
        id: "test-session-2",
        createdAt: Date.now() - 2000,
        updatedAt: Date.now(),
      }); // 2000ms

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics?.averageProcessingTime).toBe(1500); // (1000 + 2000) / 2
    });

    it("devrait réinitialiser correctement les métriques", () => {
      analytics.trackTransaction(mockSession);
      analytics.clearMetrics();

      const metrics = analytics.getNetworkMetrics(PaymentNetwork.ETHEREUM);
      expect(metrics?.totalTransactions).toBe(0);
      expect(metrics?.successfulTransactions).toBe(0);
      expect(metrics?.totalVolume).toBe("0");
    });
  });
});
