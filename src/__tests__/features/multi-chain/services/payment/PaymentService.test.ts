import { describe, it, expect, beforeEach, vi } from "vitest";
import { PaymentService } from "@/features/multi-chain/services/payment/PaymentService";
import {
  PaymentStatus,
  PaymentNetwork,
  PaymentToken,
  PaymentSession,
  PaymentError,
} from "@/features/multi-chain/services/payment/types";
import {
  TEST_TIMEOUT,
  MOCK_DELAYS,
  TEST_NETWORKS,
  mockBlockchainProvider,
  mockWalletProvider,
} from "@/__tests__/test-utils/config";

describe("PaymentService", () => {
  let paymentService: PaymentService;
  const mockToken: PaymentToken = {
    address: "0x1234567890123456789012345678901234567890",
    symbol: "TEST",
    decimals: 18,
    network: PaymentNetwork.ETHEREUM,
  };

  const mockUserId = "test-user-123";

  beforeEach(() => {
    vi.mock("@/services/blockchain/provider", () => mockBlockchainProvider());
    vi.mock("@/services/wallet/provider", () => mockWalletProvider());

    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  describe("createPaymentSession", () => {
    it("devrait créer une nouvelle session de paiement", async () => {
      const amount = "1.5";
      const session = await paymentService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount,
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUserId);
      expect(session.token).toEqual(mockToken);
      expect(session.amount).toBe(amount);
      expect(session.status).toBe(PaymentStatus.PENDING);
    });

    it("devrait valider les limites de montant", async () => {
      const tests = [
        { amount: "0", shouldThrow: true, errorMessage: "Montant invalide" },
        {
          amount: "1000000",
          shouldThrow: true,
          errorMessage: "Montant supérieur à la limite",
        },
        { amount: "0.000001", shouldThrow: false },
        { amount: "999.999", shouldThrow: false },
      ];

      for (const test of tests) {
        if (test.shouldThrow) {
          await expect(
            paymentService.createPaymentSession({
              userId: mockUserId,
              token: mockToken,
              amount: test.amount,
            })
          ).rejects.toThrow(test.errorMessage);
        } else {
          await expect(
            paymentService.createPaymentSession({
              userId: mockUserId,
              token: mockToken,
              amount: test.amount,
            })
          ).resolves.toBeDefined();
        }
      }
    });

    it("devrait valider la compatibilité du réseau", async () => {
      const invalidToken = {
        ...mockToken,
        network: "INVALID_NETWORK" as PaymentNetwork,
      };

      await expect(
        paymentService.createPaymentSession({
          userId: mockUserId,
          token: invalidToken,
          amount: "1.0",
        })
      ).rejects.toThrow("Réseau non supporté");
    });

    it("devrait gérer les erreurs de création", async () => {
      vi.spyOn(paymentService as any, "validateSession").mockImplementationOnce(
        () => {
          throw new Error("Erreur de validation");
        }
      );

      await expect(
        paymentService.createPaymentSession({
          userId: mockUserId,
          token: mockToken,
          amount: "1",
        })
      ).rejects.toThrow("Erreur de validation");
    });

    it("devrait vérifier la disponibilité du réseau", async () => {
      const networkCheckSpy = vi.spyOn(
        paymentService as any,
        "checkNetworkAvailability"
      );

      await paymentService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: "1.0",
      });

      expect(networkCheckSpy).toHaveBeenCalledWith(PaymentNetwork.ETHEREUM);
    });
  });

  describe("processPayment", () => {
    let mockSession: PaymentSession;

    beforeEach(() => {
      mockSession = {
        id: "test-session-123",
        userId: mockUserId,
        token: mockToken,
        amount: "1.5",
        status: PaymentStatus.PENDING,
        network: PaymentNetwork.ETHEREUM,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        retryCount: 0,
      };
    });

    it("devrait traiter un paiement valide", async () => {
      vi.spyOn(
        paymentService as any,
        "processTransaction"
      ).mockResolvedValueOnce({
        txHash: "0xabcdef",
        status: PaymentStatus.CONFIRMED,
      });

      const result = await paymentService.processPayment(mockSession);

      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(result.txHash).toBe("0xabcdef");
    });

    it("devrait gérer les timeouts avec différentes configurations", async () => {
      const timeoutTests = [
        { timeout: 500, shouldTimeout: true },
        { timeout: 5000, shouldTimeout: false },
      ];

      for (const test of timeoutTests) {
        vi.spyOn(
          paymentService as any,
          "processTransaction"
        ).mockImplementationOnce(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

        const result = await paymentService.processPayment(mockSession, {
          timeout: test.timeout,
        });

        if (test.shouldTimeout) {
          expect(result.status).toBe(PaymentStatus.TIMEOUT);
        } else {
          expect(result.status).not.toBe(PaymentStatus.TIMEOUT);
        }
      }
    });

    it("devrait gérer les erreurs réseau avec retry", async () => {
      const processTransactionSpy = vi.spyOn(
        paymentService as any,
        "processTransaction"
      );
      let attempts = 0;

      processTransactionSpy.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new PaymentError("Erreur réseau temporaire", "NETWORK_ERROR");
        }
        return Promise.resolve({
          txHash: "0xsuccess",
          status: PaymentStatus.CONFIRMED,
        });
      });

      const result = await paymentService.processPayment(mockSession);
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(attempts).toBe(3);
    });

    it("devrait respecter le nombre maximum de tentatives", async () => {
      vi.spyOn(paymentService as any, "processTransaction").mockRejectedValue(
        new PaymentError("Erreur réseau", "NETWORK_ERROR")
      );

      const result = await paymentService.processPayment(mockSession);
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.retryCount).toBeLessThanOrEqual(3);
    });
  });

  describe("getPaymentStatus", () => {
    it("devrait retourner le statut correct avec historique", async () => {
      const sessionId = "test-session-123";
      vi.spyOn(paymentService as any, "fetchSession").mockResolvedValueOnce({
        id: sessionId,
        status: PaymentStatus.CONFIRMED,
        statusHistory: [
          { status: PaymentStatus.PENDING, timestamp: Date.now() - 3000 },
          { status: PaymentStatus.PROCESSING, timestamp: Date.now() - 2000 },
          { status: PaymentStatus.CONFIRMED, timestamp: Date.now() - 1000 },
        ],
      });

      const result = await paymentService.getPaymentStatus(sessionId);
      expect(result).toBe(PaymentStatus.CONFIRMED);
    });

    it("devrait gérer les sessions invalides ou expirées", async () => {
      const tests = [
        {
          session: null,
          expectedError: "Session non trouvée",
        },
        {
          session: {
            id: "expired-session",
            status: PaymentStatus.PENDING,
            createdAt: Date.now() - 25 * 60 * 60 * 1000, // 25h ago
          },
          expectedError: "Session expirée",
        },
      ];

      for (const test of tests) {
        vi.spyOn(paymentService as any, "fetchSession").mockResolvedValueOnce(
          test.session
        );

        await expect(
          paymentService.getPaymentStatus("test-session")
        ).rejects.toThrow(test.expectedError);
      }
    });
  });

  describe("validatePaymentSession", () => {
    it("devrait valider une session correcte avec metadata", () => {
      const session = {
        id: "test-session-123",
        userId: mockUserId,
        token: mockToken,
        amount: "1.5",
        status: PaymentStatus.PENDING,
        network: PaymentNetwork.ETHEREUM,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        retryCount: 0,
        metadata: {
          purpose: "test-payment",
          reference: "REF123",
        },
      };

      expect(() => {
        (paymentService as any).validateSession(session);
      }).not.toThrow();
    });

    it("devrait valider les champs requis", () => {
      const requiredFields = [
        "id",
        "userId",
        "token",
        "amount",
        "status",
        "network",
      ];

      requiredFields.forEach((field) => {
        const session = {
          id: "test-session-123",
          userId: mockUserId,
          token: mockToken,
          amount: "1.5",
          status: PaymentStatus.PENDING,
          network: PaymentNetwork.ETHEREUM,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
        };

        delete (session as any)[field];

        expect(() => {
          (paymentService as any).validateSession(session);
        }).toThrow(`Champ requis manquant: ${field}`);
      });
    });
  });

  describe("Transaction Recovery", () => {
    it("devrait gérer la reprise après échec", async () => {
      const session = await paymentService.createPaymentSession({
        userId: mockUserId,
        token: mockToken,
        amount: "1.0",
      });

      // Simuler une panne pendant le traitement
      vi.spyOn(
        paymentService as any,
        "processTransaction"
      ).mockRejectedValueOnce(new Error("Panne système"));

      // Premier essai échoue
      let result = await paymentService.processPayment(session);
      expect(result.status).toBe(PaymentStatus.FAILED);

      // Restaurer le comportement normal
      (paymentService as any).processTransaction.mockResolvedValueOnce({
        txHash: "0xrecovered",
        status: PaymentStatus.CONFIRMED,
      });

      // La reprise devrait réussir
      result = await paymentService.processPayment(session);
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(result.txHash).toBe("0xrecovered");
    });
  });
});
