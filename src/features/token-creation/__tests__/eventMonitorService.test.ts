import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventMonitorService } from "../services/eventMonitorService";
import { createPublicClient } from "viem";

// Mock viem
vi.mock("viem", () => ({
  createPublicClient: vi.fn(() => ({
    getLogs: vi.fn().mockResolvedValue([
      {
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        topics: [],
        data: "0x",
        blockNumber: BigInt(1000),
      },
    ]),
    getTransactionReceipt: vi.fn().mockResolvedValue({
      status: true,
      logs: [],
    }),
  })),
  http: vi.fn(),
}));

describe("EventMonitorService", () => {
  let service: EventMonitorService;
  const mockRpcUrls = {
    ethereum: "https://eth-mainnet.example.com",
    bsc: "https://bsc-mainnet.example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EventMonitorService(mockRpcUrls);
  });

  describe("monitorTokenEvents", () => {
    it("should fetch and parse token events", async () => {
      const tokenAddress =
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`;
      const events = await service.monitorTokenEvents(
        "bsc",
        tokenAddress,
        BigInt(0)
      );

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("Transfer");
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(createPublicClient).mockImplementationOnce(() => ({
        getLogs: vi.fn().mockRejectedValue(new Error("RPC Error")),
        getTransactionReceipt: vi.fn(),
      }));

      const tokenAddress =
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`;
      const events = await service.monitorTokenEvents(
        "bsc",
        tokenAddress,
        BigInt(0)
      );

      expect(events).toHaveLength(0);
    });
  });

  describe("getTransactionEvents", () => {
    it("should fetch and parse transaction events", async () => {
      const txHash = "0xabcdef1234567890" as `0x${string}`;
      const events = await service.getTransactionEvents("bsc", txHash);

      expect(Array.isArray(events)).toBe(true);
    });

    it("should throw error for unconfigured network", async () => {
      const txHash = "0xabcdef1234567890" as `0x${string}`;

      await expect(
        service.getTransactionEvents("arbitrum" as any, txHash)
      ).rejects.toThrow("Client non configuré pour le réseau arbitrum");
    });
  });
});
