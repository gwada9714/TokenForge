import { describe, expect, it, vi, beforeEach } from "vitest";
import { polygon } from "viem/chains";
import { PolygonService } from "../../polygon/PolygonService";
import { http, type Address } from "viem";

// Configurer un timeout plus long pour les tests
vi.setConfig({ testTimeout: 30000 });

describe("PolygonService", () => {
  let service: PolygonService;
  const testAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as Address;
  const mockPublicClient = {
    getBalance: vi.fn(),
    estimateGas: vi.fn(),
    simulateContract: vi.fn(),
  };

  beforeEach(() => {
    service = new PolygonService();
    vi.clearAllMocks();

    // Mock les méthodes du client
    mockPublicClient.getBalance.mockResolvedValue(
      BigInt("1000000000000000000")
    );
    mockPublicClient.estimateGas.mockImplementation(async () => {
      return BigInt(21000);
    });
    mockPublicClient.simulateContract.mockResolvedValue({
      request: {
        abi: [],
        address: testAddress,
        functionName: "test",
        args: [],
        chain: polygon,
        account: testAddress,
      },
    });

    // Mock getWalletClient
    vi.spyOn(service as any, "getWalletClient").mockResolvedValue({
      account: {
        address: testAddress,
        type: "json-rpc",
      },
      chain: polygon,
      transport: http(),
      deployContract: vi.fn().mockResolvedValue(testAddress),
      writeContract: vi.fn().mockResolvedValue("0xhash"),
    });

    // Mock initProvider
    vi.spyOn(service as any, "initProvider").mockResolvedValue(undefined);

    // Set le client mocké
    (service as any).client = mockPublicClient;
  });

  describe("validateAddress", () => {
    it("should return false for invalid Polygon address", () => {
      const invalidAddress = "0xinvalid";
      const result = service.validateAddress(invalidAddress);
      expect(result).toBe(false);
    });

    it("should return true for valid Polygon address", () => {
      const result = service.validateAddress(testAddress);
      expect(result).toBe(true);
    });
  });

  describe("getBalance", () => {
    it("should return correct balance", async () => {
      const balance = await service.getBalance(testAddress);
      expect(balance).toBe(BigInt("1000000000000000000"));
      expect(mockPublicClient.getBalance).toHaveBeenCalledWith({
        address: testAddress,
      });
    });
  });

  describe("createToken", () => {
    it("should create token successfully", async () => {
      const params = {
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        totalSupply: "1000000000000000000000",
        owner: testAddress,
      };

      const result = await service.createToken(params);
      expect(result).toBe(testAddress);
    });
  });

  describe("addLiquidity", () => {
    it("should add liquidity successfully", async () => {
      const addLiquidityResult = await service.addLiquidity({
        tokenAddress: testAddress,
        amount: BigInt("1000000000000000000"), // 1 ETH
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      });
      expect(addLiquidityResult).toBe(true);
    });
  });

  describe("estimateFees", () => {
    it("should estimate transaction fees correctly", async () => {
      const params = {
        to: testAddress,
        value: BigInt("1000000000000000000"),
        data: "0x" as const,
      };

      const fees = await service.estimateFees(params);
      expect(fees).toBe(BigInt(21000));
      expect(mockPublicClient.estimateGas).toHaveBeenCalledWith(params);
    });
  });
});
