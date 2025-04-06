import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PaymentService } from "@/features/multi-chain/services/payment/PaymentService";
import {
  PaymentStatus,
  PaymentNetwork,
  PaymentToken,
} from "@/features/multi-chain/services/payment/types";
import { PerformanceMonitor } from "@/services/monitoring/PerformanceMonitor";
import {
  PERFORMANCE_THRESHOLDS,
  MOCK_DELAYS,
  mockBlockchainProvider,
  mockWalletProvider,
} from "@/__tests__/test-utils/config";

describe("Performance des Paiements", () => {
  let paymentService: PaymentService;
  let performanceMonitor: PerformanceMonitor;

  const mockToken: PaymentToken = {
    address: "0x1234567890123456789012345678901234567890",
    symbol: "TEST",
    decimals: 18,
    network: PaymentNetwork.ETHEREUM,
  };

  beforeEach(() => {
    vi.mock("@/services/blockchain/provider", () => mockBlockchainProvider());
    vi.mock("@/services/wallet/provider", () => mockWalletProvider());

    paymentService = new PaymentService();
    performanceMonitor = new PerformanceMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("Traitement Simultané", () => {
    it("devrait traiter plusieurs paiements simultanés efficacement", async () => {
      const numTransactions = 100;
      const transactions = Array.from({ length: numTransactions }, (_, i) => ({
        userId: `user-${i}`,
        token: mockToken,
        amount: "1.0",
      }));

      const startTime = performance.now();

      // Traiter les transactions en parallèle
      const results = await Promise.all(
        transactions.map((tx) => paymentService.createPaymentSession(tx))
      );

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Vérifier les résultats
      expect(results).toHaveLength(numTransactions);
      results.forEach((result) => {
        expect(result.status).toBe(PaymentStatus.PENDING);
      });

      // Vérifier les performances
      expect(processingTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.maxResponseTime * numTransactions
      );
      expect(processingTime / numTransactions).toBeLessThan(
        PERFORMANCE_THRESHOLDS.averageResponseTime
      );
    });

    it("devrait maintenir les performances sous charge avec monitoring", async () => {
      const metrics: Array<{
        batchSize: number;
        processingTime: number;
        memoryUsage: number;
        successRate: number;
      }> = [];

      const batchSizes = [10, 20, 50, 100, 200];

      for (const batchSize of batchSizes) {
        const transactions = Array.from({ length: batchSize }, (_, i) => ({
          userId: `user-${i}`,
          token: mockToken,
          amount: "1.0",
        }));

        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;

        const results = await Promise.all(
          transactions.map((tx) => paymentService.createPaymentSession(tx))
        );

        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;

        metrics.push({
          batchSize,
          processingTime: endTime - startTime,
          memoryUsage: endMemory - startMemory,
          successRate:
            results.filter((r) => r.status === PaymentStatus.PENDING).length /
            batchSize,
        });

        // Pause entre les lots
        await new Promise((resolve) =>
          setTimeout(resolve, MOCK_DELAYS.networkLatency)
        );
      }

      // Analyser les métriques
      metrics.forEach((metric) => {
        // Temps de traitement par transaction devrait rester stable
        expect(metric.processingTime / metric.batchSize).toBeLessThan(
          PERFORMANCE_THRESHOLDS.averageResponseTime
        );

        // Utilisation mémoire par transaction devrait diminuer (économies d'échelle)
        if (metrics.indexOf(metric) > 0) {
          const previousMetric = metrics[metrics.indexOf(metric) - 1];
          expect(metric.memoryUsage / metric.batchSize).toBeLessThan(
            previousMetric.memoryUsage / previousMetric.batchSize
          );
        }

        // Taux de succès devrait rester élevé
        expect(metric.successRate).toBeGreaterThan(0.95);
      });
    });
  });

  describe("Gestion de la Concurrence", () => {
    it("devrait gérer les accès concurrents avec verrouillage optimiste", async () => {
      const sharedResource = { value: 0 };
      const numOperations = 50;
      const lockManager = new Map<string, boolean>();

      const acquireLock = async (resourceId: string): Promise<boolean> => {
        if (lockManager.get(resourceId)) return false;
        lockManager.set(resourceId, true);
        return true;
      };

      const releaseLock = (resourceId: string): void => {
        lockManager.delete(resourceId);
      };

      const operations = Array.from({ length: numOperations }, async () => {
        const resourceId = "shared-counter";
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          if (await acquireLock(resourceId)) {
            try {
              const session = await paymentService.createPaymentSession({
                userId: "test-user",
                token: mockToken,
                amount: "1.0",
              });

              sharedResource.value += 1;
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 10)
              );

              releaseLock(resourceId);
              return session;
            } catch (error) {
              releaseLock(resourceId);
              throw error;
            }
          }
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 50)
          );
        }
        throw new Error("Max retries exceeded");
      });

      const results = await Promise.allSettled(operations);
      const successfulOperations = results.filter(
        (r) => r.status === "fulfilled"
      );

      expect(sharedResource.value).toBe(successfulOperations.length);
      expect(successfulOperations.length).toBeGreaterThan(numOperations * 0.9);
    });

    it("devrait gérer les deadlocks avec timeout et retry", async () => {
      const resources = new Map<
        string,
        { locked: boolean; owner: string | null }
      >();
      resources.set("A", { locked: false, owner: null });
      resources.set("B", { locked: false, owner: null });

      const acquireResources = async (
        resourceIds: string[],
        operationId: string,
        timeout: number
      ) => {
        const startTime = Date.now();
        const acquired = new Set<string>();

        try {
          for (const resourceId of resourceIds) {
            while (!resources.get(resourceId)?.locked) {
              if (Date.now() - startTime > timeout) {
                throw new Error("Timeout");
              }

              const resource = resources.get(resourceId)!;
              if (!resource.locked) {
                resource.locked = true;
                resource.owner = operationId;
                acquired.add(resourceId);
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }
          return true;
        } catch (error) {
          // Libérer les ressources en cas d'échec
          acquired.forEach((id) => {
            const resource = resources.get(id)!;
            resource.locked = false;
            resource.owner = null;
          });
          return false;
        }
      };

      const operation = async (resourceIds: string[], operationId: string) => {
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
          if (await acquireResources(resourceIds, operationId, 1000)) {
            // Simuler le traitement
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Libérer les ressources
            resourceIds.forEach((id) => {
              const resource = resources.get(id)!;
              resource.locked = false;
              resource.owner = null;
            });

            return true;
          }
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 100)
          );
        }
        return false;
      };

      const results = await Promise.all([
        operation(["A", "B"], "op1"),
        operation(["B", "A"], "op2"),
      ]);

      expect(results.some((r) => r)).toBe(true);
      expect(resources.get("A")?.locked).toBe(false);
      expect(resources.get("B")?.locked).toBe(false);
    });
  });

  describe("Métriques de Performance", () => {
    it("devrait collecter des métriques détaillées", async () => {
      const metrics = performanceMonitor.startMetrics();
      const detailedMetrics = {
        networkLatency: [] as number[],
        processingTimes: [] as number[],
        memorySnapshots: [] as number[],
        errors: [] as Error[],
      };

      // Exécuter une série d'opérations avec monitoring
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;

        try {
          await paymentService.createPaymentSession({
            userId: `user-${i}`,
            token: mockToken,
            amount: "1.0",
          });

          const endTime = performance.now();
          const endMemory = process.memoryUsage().heapUsed;

          detailedMetrics.networkLatency.push(MOCK_DELAYS.networkLatency);
          detailedMetrics.processingTimes.push(endTime - startTime);
          detailedMetrics.memorySnapshots.push(endMemory - startMemory);
        } catch (error) {
          detailedMetrics.errors.push(error as Error);
        }
      }

      const results = performanceMonitor.endMetrics(metrics);

      // Analyser les résultats
      expect(results).toEqual(
        expect.objectContaining({
          totalTime: expect.any(Number),
          averageResponseTime: expect.any(Number),
          maxResponseTime: expect.any(Number),
          minResponseTime: expect.any(Number),
          throughput: expect.any(Number),
          errorRate: expect.any(Number),
          p95ResponseTime: expect.any(Number),
          p99ResponseTime: expect.any(Number),
        })
      );

      // Vérifier les seuils de performance
      expect(results.averageResponseTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.averageResponseTime
      );
      expect(results.maxResponseTime).toBeLessThan(
        PERFORMANCE_THRESHOLDS.maxResponseTime
      );
      expect(results.throughput).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.minThroughput
      );
      expect(results.errorRate).toBeLessThan(0.05);

      // Analyser la distribution des temps de réponse
      const stdDev = calculateStandardDeviation(
        detailedMetrics.processingTimes
      );
      expect(stdDev).toBeLessThan(results.averageResponseTime * 0.5);
    });

    it("devrait gérer la dégradation progressive des performances", async () => {
      const baselineMetrics = await performanceMonitor.measureBaseline();
      const loadLevels = [1, 2, 5, 10];
      const degradationMetrics = [];

      for (const loadFactor of loadLevels) {
        const startTime = performance.now();
        const concurrentOperations = Array.from(
          { length: 10 * loadFactor },
          (_, i) =>
            paymentService.createPaymentSession({
              userId: `user-${i}`,
              token: mockToken,
              amount: "1.0",
            })
        );

        await Promise.all(concurrentOperations);
        const endTime = performance.now();

        degradationMetrics.push({
          loadFactor,
          responseTime: (endTime - startTime) / (10 * loadFactor),
        });
      }

      // Vérifier la dégradation progressive
      degradationMetrics.forEach((metric, index) => {
        if (index > 0) {
          const previousMetric = degradationMetrics[index - 1];
          // La dégradation ne devrait pas être plus que linéaire
          expect(
            metric.responseTime / previousMetric.responseTime
          ).toBeLessThan((metric.loadFactor / previousMetric.loadFactor) * 1.5);
        }
      });
    });
  });

  describe("Optimisation des Ressources", () => {
    it("devrait optimiser l'utilisation de la mémoire avec garbage collection", async () => {
      const memoryUsage = await performanceMonitor.trackMemoryUsage(
        async () => {
          const transactions = Array.from({ length: 1000 }, (_, i) => ({
            userId: `user-${i}`,
            token: mockToken,
            amount: "1.0",
          }));

          // Traiter par lots pour optimiser la mémoire
          const batchSize = 100;
          for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize);
            await Promise.all(
              batch.map((tx) => paymentService.createPaymentSession(tx))
            );

            // Forcer le garbage collection entre les lots
            if (global.gc) {
              global.gc();
            }
          }
        }
      );

      expect(memoryUsage.peak).toBeLessThan(
        PERFORMANCE_THRESHOLDS.maxMemoryUsage
      );
      expect(memoryUsage.leaked).toBeLessThan(1024 * 1024); // Max 1MB de fuite
    });

    it("devrait gérer efficacement les connexions avec pool", async () => {
      const connectionMetrics = await performanceMonitor.trackConnections(
        async () => {
          const transactions = Array.from({ length: 100 }, (_, i) => ({
            userId: `user-${i}`,
            token: mockToken,
            amount: "1.0",
          }));

          // Utiliser un pool de connexions
          const connectionPool = new Map<string, any>();
          const maxConnections = PERFORMANCE_THRESHOLDS.maxConnections;

          await Promise.all(
            transactions.map(async (tx) => {
              // Obtenir une connexion du pool
              let connection;
              while (!connection) {
                const availableConnection = Array.from(
                  connectionPool.entries()
                ).find(([, inUse]) => !inUse);

                if (availableConnection) {
                  connection = availableConnection[0];
                  connectionPool.set(connection, true);
                } else if (connectionPool.size < maxConnections) {
                  connection = `connection-${connectionPool.size + 1}`;
                  connectionPool.set(connection, true);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 10));
                }
              }

              try {
                await paymentService.createPaymentSession(tx);
              } finally {
                // Libérer la connexion
                connectionPool.set(connection, false);
              }
            })
          );
        }
      );

      expect(connectionMetrics.peak).toBeLessThanOrEqual(
        PERFORMANCE_THRESHOLDS.maxConnections
      );
      expect(connectionMetrics.leaked).toBe(0);
    });
  });
});

// Fonction utilitaire pour calculer l'écart-type
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
