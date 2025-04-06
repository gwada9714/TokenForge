import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TokenForgeAuthProvider } from "../../../../features/auth";
import { ConnectWalletPage } from "../../ConnectWalletPage";
import { WrongNetworkPage } from "../../WrongNetworkPage";

// Mock RainbowKit
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

// Mock Wagmi
vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useNetwork: vi.fn(),
  usePublicClient: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: "/dashboard" } } }),
}));

describe("Wallet Connection Flow", () => {
  const renderWalletFlow = () => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <Routes>
            <Route path="/connect-wallet" element={<ConnectWalletPage />} />
            <Route path="/wrong-network" element={<WrongNetworkPage />} />
          </Routes>
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows connect wallet page when wallet is not connected", () => {
    (require("wagmi") as any).useAccount.mockReturnValue({
      isConnected: false,
    });

    renderWalletFlow();

    expect(screen.getByText("Connect Your Wallet")).toBeTruthy();
    expect(screen.getByText("Connect Wallet")).toBeTruthy();
  });

  it("redirects to wrong network page on incorrect network", async () => {
    (require("wagmi") as any).useAccount.mockReturnValue({ isConnected: true });
    (require("wagmi") as any).useNetwork.mockReturnValue({
      chain: { id: 999 },
    });

    renderWalletFlow();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/wrong-network",
        expect.anything()
      );
    });
  });

  it("redirects to destination after successful connection", async () => {
    (require("wagmi") as any).useAccount.mockReturnValue({ isConnected: true });
    (require("wagmi") as any).useNetwork.mockReturnValue({ chain: { id: 1 } }); // Ethereum mainnet

    renderWalletFlow();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard",
        expect.anything()
      );
    });
  });
});
