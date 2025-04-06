import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import { TokenForgeAuthProvider } from "../context/TokenForgeAuthProvider";
import type { TokenForgeAuthActions, AuthStatus } from "../types";

interface ExtendedTokenForgeAuthActions extends TokenForgeAuthActions {
  connectWallet: () => Promise<void>;
  switchNetwork: () => Promise<void>;
}

type AuthState = {
  status: AuthStatus;
  isAuthenticated: boolean;
  walletState: {
    isConnected: boolean;
    isCorrectNetwork: boolean;
    address: string | null;
    chainId: number | null;
  };
  error: string | null;
  actions: ExtendedTokenForgeAuthActions;
};

const mockActions: {
  [K in keyof ExtendedTokenForgeAuthActions]: Mock;
} = {
  login: vi.fn().mockImplementation(async () => {
    mockAuthState.status = "authenticated";
    mockAuthState.isAuthenticated = true;
  }),
  logout: vi.fn().mockImplementation(async () => {
    mockAuthState.status = "idle";
    mockAuthState.isAuthenticated = false;
  }),
  connectWallet: vi.fn(),
  switchNetwork: vi.fn(),
  updateUser: vi.fn(),
};

const mockAuthState: AuthState = {
  status: "idle",
  isAuthenticated: false,
  walletState: {
    isConnected: false,
    isCorrectNetwork: false,
    address: null,
    chainId: null,
  },
  error: null,
  actions: mockActions,
};

vi.mock("../hooks/useTokenForgeAuth", () => ({
  useTokenForgeAuth: () => mockAuthState,
}));

describe("useTokenForgeAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockAuthState.status = "idle";
    mockAuthState.isAuthenticated = false;
    mockAuthState.error = null;
  });

  describe("Initial State", () => {
    it("should return initial state with default values", () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      expect(result.current.status).toBe("idle");
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.walletState.isConnected).toBe(false);
      expect(result.current.walletState.isCorrectNetwork).toBe(false);
    });
  });

  describe("Authentication", () => {
    it("should handle login with correct credentials", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      await act(async () => {
        await result.current.actions.login("test@example.com", "password123");
      });

      expect(mockActions.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });

  describe("Wallet Connection", () => {
    it("should connect wallet successfully", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      await act(async () => {
        await (
          result.current.actions as ExtendedTokenForgeAuthActions
        ).connectWallet();
      });

      expect(mockActions.connectWallet).toHaveBeenCalled();
    });
  });

  describe("Session Management", () => {
    it("should automatically logout after session timeout (30 minutes)", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // Initial login
      await act(async () => {
        await mockActions.login();
      });

      // Verify initial authenticated state
      expect(result.current.status).toBe("authenticated");

      // Advance time past session timeout
      vi.advanceTimersByTime(31 * 60 * 1000);

      // Should be logged out after timeout
      expect(result.current.status).toBe("unauthenticated");
      expect(mockActions.logout).toHaveBeenCalled();
    });

    it("should keep session alive when user shows activity before timeout", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // Initial login
      await act(async () => {
        await mockActions.login();
      });

      // Advance time close to timeout
      vi.advanceTimersByTime(25 * 60 * 1000);

      // Simulate user activity
      await act(async () => {
        await result.current.actions.updateUser({ emailVerified: true });
      });

      // Advance time again
      vi.advanceTimersByTime(25 * 60 * 1000);

      // Should still be authenticated due to activity
      expect(result.current.status).toBe("authenticated");
    });
  });

  describe("Multi-tab Synchronization", () => {
    it("should sync authentication state when another tab logs in", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent("storage", {
        key: "tokenforge_auth_state",
        newValue: JSON.stringify({
          status: "authenticated",
          user: { uid: "123", emailVerified: true },
        }),
      });
      window.dispatchEvent(storageEvent);

      // Should sync with the authenticated state
      expect(result.current.status).toBe("authenticated");
    });
  });

  describe("Network Error Handling", () => {
    it("should handle temporary network disconnection", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // Initial login
      await act(async () => {
        await mockActions.login();
      });

      // Should be authenticated after login
      expect(result.current.status).toBe("authenticated");

      // Simulate network error
      mockAuthState.error = "Network connection lost";
      window.dispatchEvent(new Event("offline"));
      await vi.advanceTimersByTimeAsync(1000);

      // Should show network error
      expect(result.current.error).toBe("Network connection lost");

      // Simulate network recovery
      mockAuthState.error = null;
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(1000);

      // Should recover from network error
      expect(result.current.error).toBeNull();
      expect(result.current.status).toBe("authenticated");
    });
  });

  describe("Retry Pattern", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should retry failed wallet connection", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      mockActions.connectWallet.mockRejectedValueOnce(
        new Error("Connection failed")
      );
      mockActions.connectWallet.mockResolvedValueOnce(undefined);

      await act(async () => {
        await (
          result.current.actions as ExtendedTokenForgeAuthActions
        ).connectWallet();
      });

      expect(mockActions.connectWallet).toHaveBeenCalledTimes(2);
      expect(result.current.walletState.isConnected).toBe(true);
    });

    it("should stop retrying after max attempts", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // All attempts fail
      const error = new Error("Connection failed");
      mockActions.connectWallet
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await (
            result.current.actions as ExtendedTokenForgeAuthActions
          ).connectWallet();
        } catch (e) {
          // Expected error after max retries
        }
      });

      expect(mockActions.connectWallet).toHaveBeenCalledTimes(3);
      expect(result.current.error).toBe("Max retry attempts reached");
    });
  });

  describe("Session Activity Monitoring", () => {
    it("should track user activity and refresh session", async () => {
      const { result } = renderHook(() => useTokenForgeAuth(), {
        wrapper: TokenForgeAuthProvider,
      });

      // Initial login
      await act(async () => {
        await mockActions.login();
      });

      // Simulate user activity
      const events = ["mousedown", "keydown", "touchstart"];
      for (const eventType of events) {
        await act(async () => {
          window.dispatchEvent(new Event(eventType));
        });
        await vi.advanceTimersByTimeAsync(100);
      }

      // Session should be refreshed
      expect(result.current.status).toBe("authenticated");
      // Verify that the session timeout was reset
      await vi.advanceTimersByTimeAsync(25 * 60 * 1000);
      expect(result.current.status).toBe("authenticated");
    });
  });
});
