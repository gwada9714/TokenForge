import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  type Address,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { EthereumPaymentService } from "../EthereumPaymentService";
import { COMMON_TOKEN_ADDRESSES } from "../../payment/types/TokenConfig";
import { PaymentSessionService } from "../../payment/PaymentSessionService";
import { PaymentStatus } from "../../payment/types/PaymentSession";
import { PAYMENT_CONTRACT_ABI } from "../../payment/abis/TokenABI";

vi.mock("../../payment/PaymentSessionService");

describe("EthereumPaymentService - Token Payments", () => {
  let paymentService: EthereumPaymentService;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;
  let mockSessionService: PaymentSessionService;

  beforeEach(() => {
    // Create base mock objects
    const mockReadContract = vi.fn().mockImplementation(async (args: any) => {
      if (args.functionName === "isTokenSupported") {
        return true;
      }
      return BigInt(0);
    });

    const mockWatchContractEvent = vi.fn().mockReturnValue(() => {});

    // Setup PublicClient mock
    mockPublicClient = {
      chain: { id: 1 } as Chain,
      watchContractEvent: mockWatchContractEvent,
      readContract: mockReadContract,
    } as unknown as PublicClient;

    // Setup WalletClient mock
    mockWalletClient = {
      account: { address: "0x1234..." as Address },
      signMessage: vi.fn(),
    } as unknown as WalletClient;

    // Setup PaymentSessionService mock
    const mockUpdateSessionStatus = vi.fn();
    const mockGetSession = vi.fn();
    const mockCreateSession = vi.fn();

    mockSessionService = {
      updateSessionStatus: mockUpdateSessionStatus,
      getSession: mockGetSession,
      createSession: mockCreateSession,
    } as unknown as PaymentSessionService;

    vi.mocked(PaymentSessionService.getInstance).mockReturnValue(
      mockSessionService
    );

    paymentService = EthereumPaymentService.getInstance({
      publicClient: mockPublicClient,
      walletClient: mockWalletClient,
      contractAddress: "0xcontract..." as Address,
      receiverAddress: "0xreceiver..." as Address,
    });
  });

  describe("USDT Payments", () => {
    it("should handle USDT payment creation", async () => {
      const amount = BigInt(1000000); // 1 USDT (6 decimals)
      const sessionId = "test-session-1";

      mockSessionService.updateSessionStatus = vi.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.ETH_USDT,
        amount,
        "TEST_SERVICE",
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: "isTokenSupported",
          args: [COMMON_TOKEN_ADDRESSES.ETH_USDT],
        })
      );
    });
  });

  describe("USDC Payments", () => {
    it("should handle USDC payment creation", async () => {
      const amount = BigInt(1000000); // 1 USDC (6 decimals)
      const sessionId = "test-session-2";

      mockSessionService.updateSessionStatus = vi.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.ETH_USDC,
        amount,
        "TEST_SERVICE",
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: "isTokenSupported",
          args: [COMMON_TOKEN_ADDRESSES.ETH_USDC],
        })
      );
    });
  });

  describe("DAI Payments", () => {
    it("should handle DAI payment creation", async () => {
      const amount = BigInt("1000000000000000000"); // 1 DAI (18 decimals)
      const sessionId = "test-session-3";

      mockSessionService.updateSessionStatus = vi.fn();

      const result = await paymentService.payWithToken(
        COMMON_TOKEN_ADDRESSES.ETH_DAI,
        amount,
        "TEST_SERVICE",
        sessionId,
        { gasLimit: BigInt(100000) }
      );

      expect(result).toBeDefined();
      expect(mockSessionService.updateSessionStatus).toHaveBeenCalledWith(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        expect.any(String)
      );
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.any(String),
          abi: PAYMENT_CONTRACT_ABI,
          functionName: "isTokenSupported",
          args: [COMMON_TOKEN_ADDRESSES.ETH_DAI],
        })
      );
    });
  });
});
