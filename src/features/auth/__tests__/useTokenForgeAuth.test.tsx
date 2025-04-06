import { renderHook, act } from "@testing-library/react";
import { useTokenForgeAuth } from "../hooks/useTokenForgeAuth";
import { useAccount, useDisconnect } from "wagmi";
import { usePublicClient } from "wagmi";
import { getWalletClient } from "@wagmi/core";

// Mocks
vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useDisconnect: vi.fn(),
  usePublicClient: vi.fn(),
}));

vi.mock("@wagmi/core", () => ({
  getWalletClient: vi.fn(),
}));

describe("useTokenForgeAuth", () => {
  const mockWalletClient = {} as Awaited<ReturnType<typeof getWalletClient>>;
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    // Reset mocks
    (useAccount as vi.Mock).mockReturnValue({
      address: null,
      isConnected: false,
    });

    (usePublicClient as vi.Mock).mockReturnValue({
      chain: null,
    });

    (useDisconnect as vi.Mock).mockReturnValue({
      disconnect: mockDisconnect,
    });

    (getWalletClient as vi.Mock).mockResolvedValue(mockWalletClient);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    expect(result.current).toMatchObject({
      isAuthenticated: false,
      isConnected: false,
      user: null,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
    });
  });

  it("should update wallet state when connected", async () => {
    (useAccount as vi.Mock).mockReturnValue({
      address: "0x123",
      isConnected: true,
    });

    (usePublicClient as vi.Mock).mockReturnValue({
      chain: { id: 1 }, // mainnet
    });

    const { result } = renderHook(() => useTokenForgeAuth());

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current).toMatchObject({
      isConnected: true,
      address: "0x123",
      chainId: 1,
      isCorrectNetwork: true,
    });
  });

  it("should handle admin status correctly", async () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const mockUser = { email: "admin@tokenforge.com" } as any;

    await act(async () => {
      result.current.login(mockUser);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canCreateToken).toBe(true);
  });

  it("should handle logout and wallet disconnect", async () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const mockUser = { email: "user@example.com" } as any;

    await act(async () => {
      result.current.login(mockUser);
      await result.current.logout();
    });

    expect(result.current).toMatchObject({
      isAuthenticated: false,
      isConnected: false,
      user: null,
      address: null,
    });
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
