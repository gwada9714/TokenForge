import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthenticationFlow } from "../components/AuthenticationFlow";
import { TokenForgeAuthProvider } from "../context/TokenForgeAuthProvider";

const mockUseTokenForgeAuth = {
  status: "idle",
  isAuthenticated: false,
  walletState: {
    isConnected: false,
    isCorrectNetwork: false,
    address: null,
    chainId: null,
  },
  error: null,
  actions: {
    login: vi.fn(),
    logout: vi.fn(),
    connectWallet: vi.fn(),
    switchNetwork: vi.fn(),
  },
};

vi.mock("../hooks/useTokenForgeAuth", () => ({
  useTokenForgeAuth: () => mockUseTokenForgeAuth,
}));

describe("AuthenticationFlow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render login form when not authenticated", async () => {
      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      expect(screen.getByLabelText(/email/i)).toBeDefined();
      expect(screen.getByLabelText(/password/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
    });
  });

  describe("Login Process", () => {
    it("should handle successful login", async () => {
      mockUseTokenForgeAuth.actions.login.mockResolvedValueOnce(undefined);
      const user = userEvent.setup({ delay: null });

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(mockUseTokenForgeAuth.actions.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("should display error message on login failure", async () => {
      const errorMessage = "Invalid credentials";
      mockUseTokenForgeAuth.actions.login.mockRejectedValueOnce(
        new Error(errorMessage)
      );
      const user = userEvent.setup({ delay: null });

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
        expect(screen.getByRole("alert").textContent).toContain(errorMessage);
      });
    });
  });

  describe("Wallet Connection", () => {
    beforeEach(() => {
      mockUseTokenForgeAuth.isAuthenticated = true;
    });

    it("should prompt for wallet connection after login", async () => {
      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      // Utiliser getByRole pour le titre h6 spécifiquement
      expect(
        screen.getByRole("heading", { name: /connect your wallet/i })
      ).toBeDefined();
      expect(
        screen.getByRole("button", { name: /connect wallet/i })
      ).toBeDefined();
    });

    it("should handle wallet connection", async () => {
      mockUseTokenForgeAuth.actions.connectWallet.mockResolvedValueOnce(
        undefined
      );
      const user = userEvent.setup({ delay: null });

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      const connectButton = screen.getByRole("button", {
        name: /connect wallet/i,
      });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockUseTokenForgeAuth.actions.connectWallet).toHaveBeenCalled();
      });
    });
  });

  describe("Network Switching", () => {
    beforeEach(() => {
      mockUseTokenForgeAuth.isAuthenticated = true;
      mockUseTokenForgeAuth.walletState.isConnected = true;
    });

    it("should prompt for network switch when on wrong network", async () => {
      mockUseTokenForgeAuth.walletState.isCorrectNetwork = false;

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      expect(screen.getByText(/switch.*network/i)).toBeDefined();
    });

    it("should handle network switch", async () => {
      mockUseTokenForgeAuth.walletState.isCorrectNetwork = false;
      mockUseTokenForgeAuth.actions.switchNetwork.mockResolvedValueOnce(
        undefined
      );
      const user = userEvent.setup({ delay: null });

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      await user.click(screen.getByRole("button", { name: /switch network/i }));
      expect(mockUseTokenForgeAuth.actions.switchNetwork).toHaveBeenCalled();
    });
  });

  describe("Logout Process", () => {
    beforeEach(() => {
      mockUseTokenForgeAuth.isAuthenticated = true;
      mockUseTokenForgeAuth.walletState.isConnected = true;
      mockUseTokenForgeAuth.walletState.isCorrectNetwork = true;
    });

    it("should handle logout", async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <TokenForgeAuthProvider>
          <AuthenticationFlow />
        </TokenForgeAuthProvider>
      );

      await user.click(screen.getByRole("button", { name: /logout/i }));
      expect(mockUseTokenForgeAuth.actions.logout).toHaveBeenCalled();
    });
  });
});
