import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor, screen } from "@testing-library/react";
import {
  TokenForgeAuthProvider,
  useTokenForgeAuth,
} from "../TokenForgeAuthProvider";
import { firebaseAuth } from "../../services/firebaseAuth";
import { sessionService } from "../../services/sessionService";
import { secureStorageService } from "../../services/secureStorageService";
import { securityHeadersService } from "../../services/securityHeadersService";
import { useAccount } from "wagmi";

// Mock des dépendances
vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
}));

vi.mock("../../services/firebaseAuth", () => ({
  firebaseAuth: {
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("../../services/sessionService", () => ({
  sessionService: {
    getUserSession: vi.fn(),
    createUserSession: vi.fn(),
    updateUserSession: vi.fn(),
  },
}));

vi.mock("../../services/secureStorageService", () => ({
  secureStorageService: {
    setAuthToken: vi.fn(),
    getAuthToken: vi.fn(),
    removeAuthToken: vi.fn(),
  },
}));

vi.mock("../../services/securityHeadersService", () => ({
  securityHeadersService: {
    verifySecurityHeaders: vi.fn(),
  },
}));

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const auth = useTokenForgeAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? "authenticated" : "not-authenticated"}
      </div>
      <div data-testid="wallet-status">
        {auth.wallet.isConnected ? "connected" : "not-connected"}
      </div>
    </div>
  );
};

describe("TokenForgeAuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAccount as any).mockReturnValue({ address: null, isConnected: false });
    (securityHeadersService.verifySecurityHeaders as any).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialisation", () => {
    it("should verify security headers on mount", () => {
      render(
        <TokenForgeAuthProvider>
          <TestComponent />
        </TokenForgeAuthProvider>
      );

      expect(securityHeadersService.verifySecurityHeaders).toHaveBeenCalled();
    });

    it("should initialize with default state", () => {
      render(
        <TokenForgeAuthProvider>
          <TestComponent />
        </TokenForgeAuthProvider>
      );

      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "not-authenticated"
      );
      expect(screen.getByTestId("wallet-status")).toHaveTextContent(
        "not-connected"
      );
    });
  });

  describe("Authentication Flow", () => {
    const mockFirebaseUser = {
      uid: "test-uid",
      email: "test@example.com",
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
    };

    const mockSessionData = {
      isAdmin: true,
      canCreateToken: true,
      canUseServices: true,
    };

    it("should handle successful authentication", async () => {
      // Setup mocks
      (firebaseAuth.onAuthStateChanged as any).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return () => {};
        }
      );
      (sessionService.getUserSession as any).mockResolvedValue(mockSessionData);

      await act(async () => {
        render(
          <TokenForgeAuthProvider>
            <TestComponent />
          </TokenForgeAuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent(
          "authenticated"
        );
        expect(secureStorageService.setAuthToken).toHaveBeenCalledWith(
          "mock-token"
        );
      });
    });

    it("should handle authentication errors", async () => {
      // Setup mocks pour simuler une erreur
      (firebaseAuth.onAuthStateChanged as any).mockImplementation(
        (callback) => {
          callback(mockFirebaseUser);
          return () => {};
        }
      );
      (sessionService.getUserSession as any).mockRejectedValue(
        new Error("Session error")
      );

      await act(async () => {
        render(
          <TokenForgeAuthProvider>
            <TestComponent />
          </TokenForgeAuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent(
          "not-authenticated"
        );
      });
    });
  });

  describe("Wallet Integration", () => {
    it("should update wallet state when account changes", async () => {
      // Setup mock pour le wallet connecté
      (useAccount as any).mockReturnValue({
        address: "0x123" as `0x${string}`,
        isConnected: true,
      });

      await act(async () => {
        render(
          <TokenForgeAuthProvider>
            <TestComponent />
          </TokenForgeAuthProvider>
        );
      });

      expect(screen.getByTestId("wallet-status")).toHaveTextContent(
        "connected"
      );
    });

    it("should handle wallet disconnection", async () => {
      // Simuler une déconnexion du wallet
      (useAccount as any).mockReturnValue({
        address: null,
        isConnected: false,
      });

      await act(async () => {
        render(
          <TokenForgeAuthProvider>
            <TestComponent />
          </TokenForgeAuthProvider>
        );
      });

      expect(screen.getByTestId("wallet-status")).toHaveTextContent(
        "not-connected"
      );
    });
  });

  describe("Security Headers", () => {
    it("should log error when security headers are not properly configured", () => {
      const consoleSpy = vi.spyOn(console, "error");
      (securityHeadersService.verifySecurityHeaders as any).mockReturnValue(
        false
      );

      render(
        <TokenForgeAuthProvider>
          <TestComponent />
        </TokenForgeAuthProvider>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Security headers are not properly configured"
      );
    });
  });

  describe("Cleanup", () => {
    it("should cleanup subscriptions on unmount", async () => {
      const unsubscribeMock = vi.fn();
      (firebaseAuth.onAuthStateChanged as any).mockReturnValue(unsubscribeMock);

      const { unmount } = render(
        <TokenForgeAuthProvider>
          <TestComponent />
        </TokenForgeAuthProvider>
      );

      unmount();
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
