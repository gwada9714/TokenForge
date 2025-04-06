import { vi } from "vitest";

export const storageService = {
  saveAuthState: vi.fn(),
  getAuthState: vi.fn(),
  clearAuthState: vi.fn(),
  saveWalletState: vi.fn(),
  getWalletState: vi.fn(),
  clearWalletState: vi.fn(),
  clearAll: vi.fn(),
};
