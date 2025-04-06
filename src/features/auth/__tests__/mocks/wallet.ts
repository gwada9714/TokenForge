import { vi } from "vitest";

export const mockWalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  provider: null,
};

export const mockWalletActions = {
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  switchNetwork: vi.fn(),
};

export const mockConnectedWallet = {
  isConnected: true,
  address: "0x1234567890abcdef",
  chainId: 1,
  isCorrectNetwork: true,
  provider: {} as any,
};
