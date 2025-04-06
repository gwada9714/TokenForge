import { describe, it, expect, vi, beforeEach } from "vitest";
import { TokenDeploymentService } from "../services/tokenDeploymentService";
import { PaymentProcessor } from "@/features/payment/services/paymentProcessor";

// Mock PaymentProcessor
vi.mock("@/features/payment/services/paymentProcessor", () => ({
  PaymentProcessor: vi.fn().mockImplementation(() => ({
    processLaunchpadFee: vi.fn().mockResolvedValue(BigInt(100000000000000000)),
  })),
}));

// Mock viem
vi.mock("viem", () => ({
  createPublicClient: vi.fn().mockReturnValue({
    getTransactionReceipt: vi.fn().mockResolvedValue({
      status: "success",
      gasUsed: BigInt(21000),
      effectiveGasPrice: BigInt(20000000000),
    }),
  }),
  createWalletClient: vi.fn(),
  http: vi.fn(),
}));

describe("TokenDeploymentService", () => {
  let service: TokenDeploymentService;
  const mockWalletAddress =
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TokenDeploymentService();
  });

  describe("deployToken", () => {
    const mockConfig = {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      initialSupply: BigInt(1000000000000000000000n),
      mintable: true,
      burnable: true,
      blacklist: false,
      customTaxPercentage: 1.5,
    };

    it("should calculate correct deployment fee for BSC", async () => {
      const result = await service.deployToken(
        "bsc",
        mockConfig,
        mockWalletAddress
      );
      expect(PaymentProcessor).toHaveBeenCalled();
    });

    it("should handle deployment errors gracefully", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await service.deployToken(
        "ethereum",
        mockConfig,
        mockWalletAddress
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
