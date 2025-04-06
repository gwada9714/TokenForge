import { describe, beforeEach, it, expect, vi } from "vitest";
import { PublicKey, Connection, Transaction, Keypair } from "@solana/web3.js";
import { SolanaPaymentService } from "../SolanaPaymentService";
import {
  mockWallet,
  createMockConnection,
  mockSuccessfulTransaction,
  mockTransactionError,
  mockTimeoutError,
  mockNetworkError,
  mockValidationError,
} from "./solana-mocks";
import { PROGRAM_ID_STR, RECEIVER_STR } from "./test-constants";
import { PaymentStatus } from "../../payment/types/PaymentSession";
import { PaymentSessionService } from "../../payment/PaymentSessionService";
import { MockedConnection } from "./test-types";

// Mock web3.js
vi.mock("@solana/web3.js", () => {
  const MockPublicKey = vi.fn().mockImplementation((key: string) => ({
    toBuffer: () => new Uint8Array(32).fill(1),
    toString: () => key,
    toBase58: () => key,
    equals: (other: any) => key === other.toString(),
    toBytes: () => new Uint8Array(32).fill(1),
    _bn: new Uint8Array(32).fill(1),
  }));

  const MockTransaction = vi.fn().mockImplementation((options?: any) => ({
    instructions: [],
    recentBlockhash: options?.blockhash || null,
    feePayer: options?.feePayer || null,
    add: vi.fn().mockReturnThis(),
    sign: vi.fn().mockReturnThis(),
  }));

  return {
    PublicKey: MockPublicKey,
    Connection: vi.fn(),
    Transaction: MockTransaction,
    SystemProgram: {
      transfer: vi.fn().mockReturnValue({
        programId: new MockPublicKey("11111111111111111111111111111111"),
        keys: [],
        data: new Uint8Array(),
      }),
    },
    Keypair: vi.fn(),
  };
});

// Mock PaymentSessionService
vi.mock("../../payment/PaymentSessionService", () => {
  const mockInstance = {
    sessions: new Map(),
    timeouts: new Map(),
    syncService: {},
    RETRY_LIMIT: 3,
    TIMEOUT_MS: 10000,
    createSession: vi.fn().mockImplementation(() =>
      Promise.resolve({
        id: "test-session-id",
        status: PaymentStatus.PROCESSING,
        userId: "test-user",
        amount: BigInt(1000000),
        network: "solana",
        serviceType: "test-service",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        retryCount: 0,
      })
    ),
    updateSessionStatus: vi.fn().mockResolvedValue(undefined),
    updateSession: vi.fn(),
    getSession: vi.fn(),
    getSessions: vi.fn(),
    cleanupSession: vi.fn(),
    cleanup: vi.fn(),
    setupSessionTimeout: vi.fn(),
    cleanupTimeout: vi.fn(),
    retryPayment: vi.fn(),
  };

  return {
    PaymentSessionService: {
      getInstance: vi.fn().mockReturnValue(mockInstance),
    },
  };
});

describe("SolanaTokenPayments", () => {
  let service: SolanaPaymentService;
  let connection: MockedConnection;

  const paymentAmount = BigInt(1000000);
  const serviceType = "test-service";
  const userId = "test-user";

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    connection = createMockConnection();

    service = await SolanaPaymentService.getInstance({
      connection: connection as unknown as Connection,
      wallet: mockWallet as unknown as Keypair,
      receiverAddress: new PublicKey(RECEIVER_STR),
      programId: new PublicKey(PROGRAM_ID_STR),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("payment execution", () => {
    it("should process payment successfully", async () => {
      mockSuccessfulTransaction(connection);

      const result = await service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId
      );

      expect(result).toBe("test-signature");
      expect(
        PaymentSessionService.getInstance().updateSessionStatus
      ).toHaveBeenCalledWith(
        expect.any(String),
        PaymentStatus.CONFIRMED,
        "test-signature"
      );
    });

    it("should handle transaction errors", async () => {
      mockTransactionError(connection);

      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId
        )
      ).rejects.toThrow("Payment failed: Transaction failed");

      expect(connection.sendTransaction).toHaveBeenCalledTimes(1);
      expect(
        PaymentSessionService.getInstance().updateSessionStatus
      ).toHaveBeenLastCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        undefined,
        "Transaction failed"
      );
    });

    it("should handle network errors", async () => {
      mockNetworkError(connection);

      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId
        )
      ).rejects.toThrow("Payment failed: Network error");

      expect(connection.getLatestBlockhash).toHaveBeenCalledTimes(1);
      expect(
        PaymentSessionService.getInstance().updateSessionStatus
      ).toHaveBeenLastCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        undefined,
        "Network error"
      );
    });

    it("should handle transaction confirmation timeout", async () => {
      mockTimeoutError(connection);

      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId
        )
      ).rejects.toThrow("Payment failed: timeout");

      expect(connection.sendTransaction).toHaveBeenCalledTimes(1);
      expect(
        PaymentSessionService.getInstance().updateSessionStatus
      ).toHaveBeenLastCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        undefined,
        "timeout"
      );
    });

    it("should handle transaction validation failure", async () => {
      mockValidationError(connection);

      await expect(
        service.payWithToken(
          new PublicKey(RECEIVER_STR),
          paymentAmount,
          serviceType,
          userId
        )
      ).rejects.toThrow("Payment failed: Invalid blockhash");

      expect(connection.sendTransaction).toHaveBeenCalledTimes(1);
      expect(
        PaymentSessionService.getInstance().updateSessionStatus
      ).toHaveBeenLastCalledWith(
        expect.any(String),
        PaymentStatus.FAILED,
        undefined,
        "Invalid blockhash"
      );
    });

    it("should handle transaction options", async () => {
      mockSuccessfulTransaction(connection);

      const result = await service.payWithToken(
        new PublicKey(RECEIVER_STR),
        paymentAmount,
        serviceType,
        userId,
        {
          skipPreflight: true,
          commitment: "finalized",
        }
      );

      expect(result).toBe("test-signature");
      expect(connection.sendTransaction).toHaveBeenCalledWith(
        expect.any(Transaction),
        [mockWallet],
        expect.objectContaining({
          skipPreflight: true,
          preflightCommitment: "finalized",
          maxRetries: 3,
        })
      );
    });
  });
});
