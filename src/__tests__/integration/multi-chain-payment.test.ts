import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EthereumPaymentService } from "@/features/multi-chain/services/ethereum/EthereumPaymentService";
import { PolygonPaymentService } from "@/features/multi-chain/services/polygon/PolygonPaymentService";
import { BinancePaymentService } from "@/features/multi-chain/services/binance/BinancePaymentService";
import { SolanaPaymentService } from "@/features/multi-chain/services/solana/SolanaPaymentService";
import {
  PaymentStatus,
  PaymentNetwork,
  PaymentToken,
} from "@/features/multi-chain/services/payment/types";
import { renderHook, act } from "@testing-library/react-hooks";
import { usePaymentSession } from "@/features/multi-chain/services/payment/hooks/usePaymentSession";

describe("Multi-Chain Payment Integration", () => {
  const mockUserId = "test-user-123";
  const mockAmount = "1.5";
  const services = {
    [PaymentNetwork.ETHEREUM]: new EthereumPaymentService(),
    [PaymentNetwork.POLYGON]: new PolygonPaymentService(),
    [PaymentNetwork.BINANCE]: new BinancePaymentService(),
    [PaymentNetwork.SOLANA]: new SolanaPaymentService(),
  };

  const mockTokens = {
    [PaymentNetwork.ETHEREUM]: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      decimals: 6,
      network: PaymentNetwork.ETHEREUM,
    },
    [PaymentNetwork.POLYGON]: {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      decimals: 6,
      network: PaymentNetwork.POLYGON,
    },
    [PaymentNetwork.BINANCE]: {
      address: "0x55d398326f99059fF775485246999027B3197955",
      symbol: "USDT",
      decimals: 18,
      network: PaymentNetwork.BINANCE,
    },
    [PaymentNetwork.SOLANA]: {
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      symbol: "USDT",
      decimals: 6,
      network: PaymentNetwork.SOLANA,
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("Cross-Chain Payment Flow", () => {
    it("devrait gérer les paiements sur différentes chaînes", async () => {
      for (const network of Object.values(PaymentNetwork)) {
        const service = services[network];
        const token = mockTokens[network];

        const { result } = renderHook(() =>
          usePaymentSession({
            chainService: service,
            userId: mockUserId,
            token,
            amount: mockAmount,
          })
        );

        // Créer une session
        await act(async () => {
          await result.current.createSession(token, mockAmount);
        });

        expect(result.current.session).toBeDefined();
        expect(result.current.session?.network).toBe(network);
        expect(result.current.session?.status).toBe(PaymentStatus.PENDING);

        // Traiter le paiement
        await act(async () => {
          await result.current.processPayment();
        });

        expect(result.current.session?.status).toBe(PaymentStatus.CONFIRMED);
        expect(result.current.error).toBeNull();
      }
    });

    it("devrait gérer les timeouts spécifiques à chaque chaîne", async () => {
      const timeouts = {
        [PaymentNetwork.ETHEREUM]: 60000,
        [PaymentNetwork.POLYGON]: 30000,
        [PaymentNetwork.BINANCE]: 15000,
      };

      for (const [network, timeout] of Object.entries(timeouts)) {
        const service = services[network as PaymentNetwork];
        const token = mockTokens[network as PaymentNetwork];

        const session = await service.createPaymentSession({
          userId: mockUserId,
          token,
          amount: mockAmount,
        });

        // Simuler une transaction lente
        vi.spyOn(service as any, "sendTransaction").mockImplementationOnce(
          () => new Promise((resolve) => setTimeout(resolve, timeout + 5000))
        );

        const result = await service.processPayment(session, { timeout });
        expect(result.status).toBe(PaymentStatus.TIMEOUT);
      }
    });

    it("devrait valider les confirmations selon les spécificités de chaque chaîne", async () => {
      const confirmationRequirements = {
        [PaymentNetwork.ETHEREUM]: 12,
        [PaymentNetwork.POLYGON]: 3,
        [PaymentNetwork.BINANCE]: 1,
      };

      for (const [network, requiredConfirmations] of Object.entries(
        confirmationRequirements
      )) {
        const service = services[network as PaymentNetwork];
        const token = mockTokens[network as PaymentNetwork];

        const session = await service.createPaymentSession({
          userId: mockUserId,
          token,
          amount: mockAmount,
        });

        const processedSession = await service.processPayment(session);
        expect(processedSession.txHash).toBeDefined();

        // Simuler différents nombres de confirmations
        for (let i = 0; i < requiredConfirmations + 1; i++) {
          vi.spyOn(service as any, "provider", "get").mockImplementation(
            () => ({
              getTransactionReceipt: vi.fn().mockResolvedValue({
                status: 1,
                blockNumber: 1000,
              }),
              getBlockNumber: vi.fn().mockResolvedValue(1000 + i),
            })
          );

          const isValid = await service.validateTransaction(
            processedSession.txHash!
          );
          expect(isValid).toBe(i >= requiredConfirmations);
        }
      }
    });
  });

  describe("Error Handling par Chaîne", () => {
    it("devrait gérer les erreurs spécifiques à chaque chaîne", async () => {
      const networkErrors = {
        [PaymentNetwork.ETHEREUM]: "insufficient gas",
        [PaymentNetwork.POLYGON]: "nonce too low",
        [PaymentNetwork.BINANCE]: "out of gas",
      };

      for (const [network, errorMessage] of Object.entries(networkErrors)) {
        const service = services[network as PaymentNetwork];
        const token = mockTokens[network as PaymentNetwork];

        const session = await service.createPaymentSession({
          userId: mockUserId,
          token,
          amount: mockAmount,
        });

        vi.spyOn(service as any, "sendTransaction").mockRejectedValueOnce(
          new Error(errorMessage)
        );

        const result = await service.processPayment(session);
        expect(result.status).toBe(PaymentStatus.FAILED);
        expect(result.error).toContain(errorMessage);
      }
    });

    it("devrait implémenter la reprise spécifique à chaque chaîne", async () => {
      for (const network of Object.values(PaymentNetwork)) {
        const service = services[network];
        const token = mockTokens[network];

        const session = await service.createPaymentSession({
          userId: mockUserId,
          token,
          amount: mockAmount,
        });

        // Simuler une erreur réseau suivie d'un succès
        vi.spyOn(service as any, "sendTransaction")
          .mockRejectedValueOnce(new Error("Network error"))
          .mockResolvedValueOnce("0xtxhash");

        const result = await service.processPayment(session);
        expect(result.status).toBe(PaymentStatus.CONFIRMED);
        expect(result.retryCount).toBeGreaterThan(0);
      }
    });
  });

  describe("Performance par Chaîne", () => {
    it("devrait respecter les seuils de performance de chaque chaîne", async () => {
      const performanceThresholds = {
        [PaymentNetwork.ETHEREUM]: { maxTime: 60000, avgTime: 15000 },
        [PaymentNetwork.POLYGON]: { maxTime: 30000, avgTime: 5000 },
        [PaymentNetwork.BINANCE]: { maxTime: 15000, avgTime: 3000 },
      };

      for (const [network, thresholds] of Object.entries(
        performanceThresholds
      )) {
        const service = services[network as PaymentNetwork];
        const token = mockTokens[network as PaymentNetwork];
        const startTime = Date.now();

        const session = await service.createPaymentSession({
          userId: mockUserId,
          token,
          amount: mockAmount,
        });

        const result = await service.processPayment(session);
        const processingTime = Date.now() - startTime;

        expect(result.status).toBe(PaymentStatus.CONFIRMED);
        expect(processingTime).toBeLessThan(thresholds.maxTime);
        expect(processingTime).toBeLessThan(thresholds.avgTime * 1.5);
      }
    });
  });

  describe("Solana Specific Tests", () => {
    it("devrait gérer les confirmations rapides de Solana", async () => {
      const service = services[PaymentNetwork.SOLANA];
      const token = mockTokens[PaymentNetwork.SOLANA];

      const session = await service.createPaymentSession({
        userId: mockUserId,
        token,
        amount: mockAmount,
      });

      // Simuler une confirmation rapide
      vi.spyOn(service as any, "connection", "get").mockImplementation(() => ({
        confirmTransaction: vi.fn().mockResolvedValue({
          value: { err: null },
        }),
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "mock-blockhash",
          lastValidBlockHeight: 1000,
        }),
        getBlockHeight: vi.fn().mockResolvedValue(1001),
      }));

      const result = await service.processPayment(session);
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(Date.now() - result.updatedAt).toBeLessThan(1000); // Moins d'une seconde
    });

    it("devrait gérer les erreurs de blockhash expiré", async () => {
      const service = services[PaymentNetwork.SOLANA];
      const token = mockTokens[PaymentNetwork.SOLANA];

      const session = await service.createPaymentSession({
        userId: mockUserId,
        token,
        amount: mockAmount,
      });

      // Simuler une erreur de blockhash
      vi.spyOn(service as any, "connection", "get").mockImplementation(() => ({
        confirmTransaction: vi
          .fn()
          .mockRejectedValueOnce(new Error("blockhash not found"))
          .mockResolvedValueOnce({
            value: { err: null },
          }),
        getLatestBlockhash: vi.fn().mockResolvedValue({
          blockhash: "new-mock-blockhash",
          lastValidBlockHeight: 1000,
        }),
        getBlockHeight: vi.fn().mockResolvedValue(1001),
      }));

      const result = await service.processPayment(session);
      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(result.retryCount).toBeGreaterThan(0);
    });

    it("devrait respecter les seuils de performance de Solana", async () => {
      const service = services[PaymentNetwork.SOLANA];
      const token = mockTokens[PaymentNetwork.SOLANA];
      const maxProcessingTime = 1000; // 1 seconde max

      const startTime = Date.now();
      const session = await service.createPaymentSession({
        userId: mockUserId,
        token,
        amount: mockAmount,
      });

      const result = await service.processPayment(session);
      const processingTime = Date.now() - startTime;

      expect(result.status).toBe(PaymentStatus.CONFIRMED);
      expect(processingTime).toBeLessThan(maxProcessingTime);
    });

    it("devrait gérer les tokens SPL correctement", async () => {
      const service = services[PaymentNetwork.SOLANA];
      const token = mockTokens[PaymentNetwork.SOLANA];

      // Simuler un compte de token SPL
      vi.spyOn(service as any, "connection", "get").mockImplementation(() => ({
        getTokenAccountsByOwner: vi.fn().mockResolvedValue({
          value: [
            {
              pubkey: "mock-token-account",
            },
          ],
        }),
        getTokenAccountBalance: vi.fn().mockResolvedValue({
          value: {
            amount: "1000000000", // 1000 USDT avec 6 décimales
            decimals: 6,
          },
        }),
      }));

      const session = await service.createPaymentSession({
        userId: mockUserId,
        token,
        amount: "100", // 100 USDT
      });

      await expect(service.checkBalance(session)).resolves.not.toThrow();
    });
  });
});
