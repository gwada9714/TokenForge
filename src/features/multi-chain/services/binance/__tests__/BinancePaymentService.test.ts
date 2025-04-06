import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Address } from "viem";
import {
  BinancePaymentService,
  BinancePaymentConfig,
} from "../BinancePaymentService";
import { PaymentSessionService } from "../../payment/PaymentSessionService";
import {
  PaymentNetwork,
  PaymentStatus,
  PaymentToken,
} from "../../payment/types/PaymentSession";
import {
  mockPublicClient,
  mockWalletClient,
  mockContractEvent,
} from "../../../../../test/mocks/viem";
import { COMMON_TOKEN_ADDRESSES } from "../../payment/types/TokenConfig";

describe("BinancePaymentService", () => {
  let service: BinancePaymentService;
  let sessionService: PaymentSessionService;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
  const PAYMENT_AMOUNT = 1000000000000000000n; // 1 BNB/Token

  const mockConfig: BinancePaymentConfig = {
    contractAddress: "0x1234567890123456789012345678901234567890" as Address,
    receiverAddress: "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A" as Address,
    publicClient: mockPublicClient,
    walletClient: mockWalletClient,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock responses
    mockPublicClient.readContract.mockImplementation(
      async ({ functionName }) => {
        switch (functionName) {
          case "supportedTokens":
            return true;
          case "getGasPrice":
            return 5000000000n; // 5 gwei
          case "balanceOf":
            return PAYMENT_AMOUNT;
          case "allowance":
            return 0n;
          default:
            return undefined;
        }
      }
    );

    mockPublicClient.simulateContract.mockResolvedValue({
      request: {
        abi: [],
        address: mockConfig.contractAddress,
        args: [],
        functionName: "mockFunction",
        account: mockConfig.walletClient.account,
      },
    });

    // Initialize services
    sessionService = PaymentSessionService.getInstance();
    service = BinancePaymentService.getInstance(mockConfig);
  });

  afterEach(() => {
    service.cleanup();
    sessionService.cleanup();
    BinancePaymentService.resetInstance();
  });

  describe("payment processing", () => {
    it("should process BNB payment successfully", async () => {
      const sessionId = "test-session";
      const nativeToken: PaymentToken & { address: Address } = {
        address: ZERO_ADDRESS,
        network: PaymentNetwork.BINANCE,
        symbol: "BNB",
        decimals: 18,
      };

      await service.payWithToken(
        nativeToken.address,
        PAYMENT_AMOUNT,
        "native_payment",
        sessionId,
        {}
      );

      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });

    it("should process BUSD payment successfully", async () => {
      const sessionId = "test-session";
      const busdToken: PaymentToken & { address: Address } = {
        address: COMMON_TOKEN_ADDRESSES.BSC_BUSD,
        network: PaymentNetwork.BINANCE,
        symbol: "BUSD",
        decimals: 18,
      };

      // Mock approve call
      const approveCall = vi
        .mocked(mockWalletClient.writeContract)
        .mockResolvedValueOnce("0xapproved");

      await service.payWithToken(
        busdToken.address,
        PAYMENT_AMOUNT,
        "token_payment",
        sessionId,
        {}
      );

      // Vérifier que approve a été appelé avant le paiement
      expect(approveCall).toHaveBeenCalledTimes(1);
      expect(mockWalletClient.writeContract).toHaveBeenCalledTimes(2);
    });

    it("should handle payment failure", async () => {
      const sessionId = "test-session";
      const nativeToken: PaymentToken & { address: Address } = {
        address: ZERO_ADDRESS,
        network: PaymentNetwork.BINANCE,
        symbol: "BNB",
        decimals: 18,
      };

      mockWalletClient.writeContract.mockRejectedValueOnce(
        new Error("Payment failed")
      );

      await expect(
        service.payWithToken(
          nativeToken.address,
          PAYMENT_AMOUNT,
          "native_payment",
          sessionId,
          {}
        )
      ).rejects.toThrow("Payment failed");
    });

    it("should handle BEP20 approval failure", async () => {
      const sessionId = "test-session";
      const busdToken: PaymentToken & { address: Address } = {
        address: COMMON_TOKEN_ADDRESSES.BSC_BUSD,
        network: PaymentNetwork.BINANCE,
        symbol: "BUSD",
        decimals: 18,
      };

      mockWalletClient.writeContract.mockRejectedValueOnce(
        new Error("Approval failed")
      );

      await expect(
        service.payWithToken(
          busdToken.address,
          PAYMENT_AMOUNT,
          "token_payment",
          sessionId,
          {}
        )
      ).rejects.toThrow("Approval failed");

      // Vérifier qu'aucun paiement n'a été tenté après l'échec de l'approbation
      expect(mockWalletClient.writeContract).toHaveBeenCalledTimes(1);
    });
  });

  describe("event handling", () => {
    it("should handle payment processed event", async () => {
      const session = sessionService.createSession(
        "user123",
        PAYMENT_AMOUNT,
        {
          address: ZERO_ADDRESS,
          network: PaymentNetwork.BINANCE,
          symbol: "BNB",
          decimals: 18,
        } as PaymentToken & { address: Address },
        "native_payment"
      );

      mockPublicClient.watchContractEvent.mockImplementationOnce(
        ({ onLogs }) => {
          onLogs([
            {
              ...mockContractEvent,
              args: {
                payer: mockWalletClient.account?.address,
                amount: PAYMENT_AMOUNT,
                sessionId: session.id,
              },
            },
          ]);
          return () => {};
        }
      );

      await service["setupEventListeners"]();

      const updatedSession = sessionService.getSession(session.id);
      expect(updatedSession?.status).toBe(PaymentStatus.CONFIRMED);
    });
  });

  describe("token support", () => {
    it("should return true for supported token", async () => {
      const result = await service.isTokenSupported(ZERO_ADDRESS);
      expect(result).toBe(true);
    });

    it("should handle token check failure", async () => {
      mockPublicClient.readContract.mockRejectedValueOnce(
        new Error("Failed to check token")
      );

      await expect(service.isTokenSupported(ZERO_ADDRESS)).rejects.toThrow(
        "Failed to check token"
      );
    });

    it("should verify BUSD is supported", async () => {
      const result = await service.isTokenSupported(
        COMMON_TOKEN_ADDRESSES.BSC_BUSD
      );
      expect(result).toBe(true);
    });
  });

  describe("gas estimation", () => {
    it("should estimate gas for transaction", async () => {
      const sessionId = "test-session";

      const estimatedGas = 21000n;
      vi.mocked(mockPublicClient.estimateContractGas).mockResolvedValueOnce(
        estimatedGas
      );

      await service.payWithToken(
        ZERO_ADDRESS,
        PAYMENT_AMOUNT,
        "native_payment",
        sessionId,
        {}
      );

      expect(mockPublicClient.getBlock).toHaveBeenCalled();
      expect(mockPublicClient.estimateMaxPriorityFeePerGas).toHaveBeenCalled();
      expect(mockPublicClient.estimateContractGas).toHaveBeenCalled();
    });

    it("should handle gas estimation failure", async () => {
      const sessionId = "test-session";

      vi.mocked(mockPublicClient.estimateContractGas).mockRejectedValueOnce(
        new Error("Gas estimation failed")
      );

      await expect(
        service.payWithToken(
          ZERO_ADDRESS,
          PAYMENT_AMOUNT,
          "native_payment",
          sessionId,
          {}
        )
      ).rejects.toThrow("Gas estimation failed");
    });
  });
});
