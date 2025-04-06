import { Contract, JsonRpcProvider } from "ethers";
import { type PublicClient } from "viem";
import { vi } from "vitest";

export const mockProvider = {
  getNetwork: vi.fn(),
  getBlockNumber: vi.fn(),
  destroy: vi.fn(),
} as unknown as PublicClient;

export const mockTokenContract = {
  name: vi.fn().mockResolvedValue("Test Token"),
  symbol: vi.fn().mockResolvedValue("TEST"),
  decimals: vi.fn().mockResolvedValue(18),
  totalSupply: vi.fn().mockResolvedValue(1000000),
  owner: vi
    .fn()
    .mockResolvedValue("0x1234567890123456789012345678901234567890"),
  allowance: vi.fn().mockResolvedValue(1000),
  runner: mockProvider,
} as unknown as Contract;

export const mockTokenForgeFactory = {
  getUserTokens: vi
    .fn()
    .mockResolvedValue([
      "0x1234567890123456789012345678901234567890",
      "0x0987654321098765432109876543210987654321",
    ]),
  runner: mockProvider,
} as unknown as Contract;

export const mockMarketplaceContract = {
  getItemCount: vi.fn().mockResolvedValue(2),
  getItem: vi.fn().mockImplementation(async (id: number) => ({
    id,
    seller: "0x1234567890123456789012345678901234567890",
    tokenAddress: "0x0987654321098765432109876543210987654321",
    amount: 1000,
    price: "1000000000000000000",
    status: "active",
  })),
  listItem: vi.fn().mockImplementation(async () => ({
    wait: vi.fn().mockResolvedValue({
      events: [{ event: "ItemListed" }],
    }),
  })),
  runner: mockProvider,
} as unknown as Contract;
