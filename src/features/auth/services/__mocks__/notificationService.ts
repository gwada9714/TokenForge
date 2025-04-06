import { vi } from "vitest";

export const notificationService = {
  notifyLoginSuccess: vi.fn(),
  notifyLoginError: vi.fn(),
  notifyLogout: vi.fn(),
  notifyEmailVerified: vi.fn(),
  notifyEmailVerificationError: vi.fn(),
  notifyWalletConnected: vi.fn(),
  notifyWalletDisconnected: vi.fn(),
  notifyNetworkChanged: vi.fn(),
};
