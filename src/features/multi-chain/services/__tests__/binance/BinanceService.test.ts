import { describe, it, expect, beforeEach, vi } from "vitest";
import { BinanceService } from "../../binance/BinanceService";
import {
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  createPublicClient,
  createWalletClient,
} from "viem";
import { BEP20_ABI, PANCAKESWAP_ROUTER_ABI } from "../../binance/abi";

// Mock des dépendances
vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    createPublicClient: vi.fn(),
    createWalletClient: vi.fn(),
  };
});

describe("BinanceService", () => {
  let service: BinanceService;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;
  const testAddress = "0x1234567890123456789012345678901234567890" as Address;
  const mockTxHash =
    "0x1234567890123456789012345678901234567890123456789012345678901234" as Hash;
  const PANCAKESWAP_ROUTER_ADDRESS =
    "0x1234567890123456789012345678901234567890" as Address;
  const bsc = "bsc";

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuration des mocks
    mockPublicClient = {
      getBalance: vi.fn(),
      simulateContract: vi.fn(),
      waitForTransactionReceipt: vi.fn(),
    } as unknown as PublicClient;

    mockWalletClient = {
      account: {
        address: testAddress,
      },
      deployContract: vi.fn(),
      writeContract: vi.fn(),
    } as unknown as WalletClient;

    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient);
    vi.mocked(createWalletClient).mockReturnValue(mockWalletClient);

    // Création d'une nouvelle instance du service
    service = new BinanceService();
    // @ts-ignore accès à la propriété privée pour les tests
    service.client = mockPublicClient;
  });

  describe("getNativeTokenPrice", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it("should return BNB price when API call is successful", async () => {
      const mockPrice = 100;
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ binancecoin: { usd: mockPrice } }),
      } as Response);

      const price = await service.getNativeTokenPrice();
      expect(price).toBe(mockPrice);
    });

    it("should return 0 when API call fails", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("API Error"));

      const price = await service.getNativeTokenPrice();
      expect(price).toBe(0);
    });
  });

  describe("getBalance", () => {
    it("should return correct balance", async () => {
      const mockBalance = BigInt("1000000000000000000"); // 1 BNB
      vi.mocked(mockPublicClient.getBalance).mockResolvedValueOnce(mockBalance);

      const balance = await service.getBalance(testAddress);
      expect(balance).toBe(mockBalance);
      expect(mockPublicClient.getBalance).toHaveBeenCalledWith({
        address: testAddress,
      });
    });

    it("should throw error when provider fails", async () => {
      vi.mocked(mockPublicClient.getBalance).mockRejectedValueOnce(
        new Error("Provider Error")
      );

      await expect(service.getBalance(testAddress)).rejects.toThrow(
        "Failed to get balance"
      );
    });
  });

  describe("validateAddress", () => {
    it("should return true for valid BSC address", () => {
      expect(service.validateAddress(testAddress)).toBe(true);
    });

    it("should return false for invalid BSC address", () => {
      expect(service.validateAddress("invalid-address")).toBe(false);
    });
  });

  describe("createToken", () => {
    const mockParams = {
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: "1000000",
      owner: testAddress,
    };

    it("should create BEP20 token successfully", async () => {
      const mockContractAddress =
        "0x9876543210987654321098765432109876543210" as Address;
      vi.mocked(mockPublicClient.simulateContract).mockResolvedValueOnce({
        request: {
          account: mockWalletClient.account,
          address: PANCAKESWAP_ROUTER_ADDRESS,
          abi: BEP20_ABI,
          args: [
            mockParams.name,
            mockParams.symbol,
            mockParams.decimals,
            BigInt(mockParams.totalSupply),
            mockParams.owner,
          ],
          chain: bsc,
        } as any,
        result: mockContractAddress,
      } as any);
      vi.mocked(mockWalletClient.deployContract).mockResolvedValueOnce(
        mockTxHash
      );
      vi.mocked(
        mockPublicClient.waitForTransactionReceipt
      ).mockResolvedValueOnce({
        contractAddress: mockContractAddress,
      } as any);

      const result = await service.createToken(mockParams);
      expect(result).toBe(mockContractAddress);
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.deployContract).toHaveBeenCalled();
    });

    it("should throw error when token creation fails", async () => {
      vi.mocked(mockPublicClient.simulateContract).mockRejectedValueOnce(
        new Error("Contract creation failed")
      );

      await expect(service.createToken(mockParams)).rejects.toThrow(
        "Failed to create BEP20 token"
      );
    });
  });

  describe("addLiquidity", () => {
    const mockParams = {
      tokenAddress: testAddress,
      amount: BigInt("1000000000000000000"),
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    it("should add liquidity successfully", async () => {
      vi.mocked(mockPublicClient.simulateContract).mockResolvedValueOnce({
        request: {
          account: mockWalletClient.account,
          address: PANCAKESWAP_ROUTER_ADDRESS,
          abi: PANCAKESWAP_ROUTER_ABI,
          args: [
            mockParams.tokenAddress,
            mockParams.amount,
            BigInt(0),
            BigInt(0),
            testAddress,
            mockParams.deadline,
          ],
          chain: bsc,
          value: mockParams.amount,
        } as any,
        result: [BigInt(1), BigInt(1), BigInt(1)],
      } as any);
      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(
        mockTxHash
      );
      vi.mocked(
        mockPublicClient.waitForTransactionReceipt
      ).mockResolvedValueOnce({} as any);

      const result = await service.addLiquidity(mockParams);
      expect(result).toBe(true);
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });

    it("should throw error when adding liquidity fails", async () => {
      vi.mocked(mockPublicClient.simulateContract).mockRejectedValueOnce(
        new Error("Liquidity add failed")
      );

      await expect(service.addLiquidity(mockParams)).rejects.toThrow(
        "Failed to add liquidity on PancakeSwap"
      );
    });
  });

  describe("removeLiquidity", () => {
    const mockParams = {
      tokenAddress: testAddress,
      amount: BigInt("1000000000000000000"),
      deadline: Math.floor(Date.now() / 1000) + 3600,
    };

    it("should remove liquidity successfully", async () => {
      vi.mocked(mockPublicClient.simulateContract).mockResolvedValueOnce({
        request: {
          account: mockWalletClient.account,
          address: PANCAKESWAP_ROUTER_ADDRESS,
          abi: PANCAKESWAP_ROUTER_ABI,
          args: [
            mockParams.tokenAddress,
            mockParams.amount,
            BigInt(0),
            BigInt(0),
            testAddress,
            mockParams.deadline,
          ],
          chain: bsc,
        } as any,
        result: [BigInt(1), BigInt(1)],
      } as any);
      vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(
        mockTxHash
      );
      vi.mocked(
        mockPublicClient.waitForTransactionReceipt
      ).mockResolvedValueOnce({} as any);

      const result = await service.removeLiquidity(mockParams);
      expect(result).toBe(true);
      expect(mockPublicClient.simulateContract).toHaveBeenCalled();
      expect(mockWalletClient.writeContract).toHaveBeenCalled();
    });

    it("should throw error when removing liquidity fails", async () => {
      vi.mocked(mockPublicClient.simulateContract).mockRejectedValueOnce(
        new Error("Liquidity removal failed")
      );

      await expect(service.removeLiquidity(mockParams)).rejects.toThrow(
        "Failed to remove liquidity from PancakeSwap"
      );
    });
  });

  describe("stake", () => {
    it("should throw not implemented error", async () => {
      await expect(
        service.stake({
          tokenAddress: testAddress,
          amount: BigInt("1000000000000000000"),
          duration: 30,
        })
      ).rejects.toThrow("Staking not implemented for BSC yet");
    });
  });

  describe("unstake", () => {
    it("should throw not implemented error", async () => {
      await expect(
        service.unstake({
          tokenAddress: testAddress,
          amount: BigInt("1000000000000000000"),
        })
      ).rejects.toThrow("Unstaking not implemented for BSC yet");
    });
  });
});
