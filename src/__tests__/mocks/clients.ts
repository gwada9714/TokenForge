import { PublicClient, WalletClient, createPublicClient } from "viem";
import { bsc } from "viem/chains";

// Mock du client public
export const mockPublicClient = {
  chain: bsc,
  request: async () => "0x0",
  estimateContractGas: async () => BigInt(100000),
  waitForTransactionReceipt: async () => ({
    status: "success",
    contractAddress: "0x1234567890123456789012345678901234567890",
  }),
} as unknown as PublicClient;

// Mock du client wallet
export const mockWalletClient = {
  account: {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" as `0x${string}`,
    type: "json-rpc",
    source: "local",
  },
  chain: bsc,
  key: "mock-wallet",
  name: "Mock Wallet",
  uid: "mock-wallet-1",
  cacheTime: 4_000,
  pollingInterval: 4_000,
  request: async () => "0x0" as `0x${string}`,
  deployContract: async () =>
    "0x1234567890123456789012345678901234567890" as `0x${string}`,
  writeContract: async () => "0xabcdef1234567890" as `0x${string}`,
  extend: () => mockWalletClient,
} as unknown as WalletClient;
