import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TokenForgeAuthProvider } from "../../features/auth";
import { tokenRoutes } from "../routes/token.routes";
import { adminRoutes } from "../routes/admin.routes";
import { dashboardRoutes } from "../routes/dashboard.routes";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock Wagmi
vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useNetwork: vi.fn(),
  usePublicClient: vi.fn(),
}));

describe("Protected Routes", () => {
  const renderWithRouter = (initialEntries = ["/"]) => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TokenForgeAuthProvider>
          <Routes>
            {[...tokenRoutes, ...adminRoutes, ...dashboardRoutes].map(
              (route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              )
            )}
          </Routes>
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );
  };

  describe("Token Routes", () => {
    beforeEach(() => {
      (require("wagmi") as any).useAccount.mockReturnValue({
        isConnected: false,
      });
      (require("wagmi") as any).useNetwork.mockReturnValue({ chain: null });
    });

    it("redirects to connect wallet page when wallet is not connected", () => {
      renderWithRouter(["/tokens"]);
      expect(screen.getByText("Connect Your Wallet")).toBeTruthy();
    });

    it("redirects to wrong network page when on incorrect network", () => {
      (require("wagmi") as any).useAccount.mockReturnValue({
        isConnected: true,
      });
      (require("wagmi") as any).useNetwork.mockReturnValue({
        chain: { id: 999 },
      });

      renderWithRouter(["/tokens"]);
      expect(screen.getByText("Wrong Network")).toBeTruthy();
    });

    it("shows token dashboard when all conditions are met", () => {
      (require("wagmi") as any).useAccount.mockReturnValue({
        isConnected: true,
      });
      (require("wagmi") as any).useNetwork.mockReturnValue({
        chain: { id: 1 },
      });

      renderWithRouter(["/tokens"]);
      expect(screen.getByText("Token Dashboard")).toBeTruthy();
    });
  });

  describe("Admin Routes", () => {
    beforeEach(() => {
      (require("wagmi") as any).useAccount.mockReturnValue({
        isConnected: true,
      });
      (require("wagmi") as any).useNetwork.mockReturnValue({
        chain: { id: 1 },
      });
    });

    it("redirects to unauthorized page when user is not admin", () => {
      renderWithRouter(["/admin"]);
      expect(screen.getByText("Access Denied")).toBeTruthy();
    });

    it("shows admin dashboard when user is admin", () => {
      (require("firebase/auth") as any).getAuth.mockReturnValue({
        currentUser: { email: "admin@tokenforge.com" },
      });

      renderWithRouter(["/admin"]);
      expect(screen.getByText("Admin Dashboard")).toBeTruthy();
    });
  });

  describe("Dashboard Routes", () => {
    it("redirects to login when user is not authenticated", () => {
      (require("firebase/auth") as any).getAuth.mockReturnValue({
        currentUser: null,
      });

      renderWithRouter(["/dashboard"]);
      expect(screen.getByText("Sign In")).toBeTruthy();
    });

    it("shows dashboard when user is authenticated", () => {
      (require("firebase/auth") as any).getAuth.mockReturnValue({
        currentUser: { email: "user@example.com" },
      });

      renderWithRouter(["/dashboard"]);
      expect(screen.getByText("User Dashboard")).toBeTruthy();
    });
  });
});
