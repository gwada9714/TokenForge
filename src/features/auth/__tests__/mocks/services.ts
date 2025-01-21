import { vi } from 'vitest';

export const mockSessionService = {
  getUserSession: vi.fn(),
  clearSession: vi.fn(),
  setSession: vi.fn()
};

export const mockErrorService = {
  handleError: vi.fn(),
  isAuthError: vi.fn()
};

export const mockNotificationService = {
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyWalletConnected: vi.fn(),
  notifyWalletDisconnected: vi.fn()
};
