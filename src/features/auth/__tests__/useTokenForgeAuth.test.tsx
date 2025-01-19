import { renderHook, act } from '@testing-library/react';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { getWalletClient } from '@wagmi/core';

// Mocks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
  useDisconnect: jest.fn(),
}));

jest.mock('@wagmi/core', () => ({
  getWalletClient: jest.fn(),
}));

describe('useTokenForgeAuth', () => {
  const mockWalletClient = {} as Awaited<ReturnType<typeof getWalletClient>>;
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    // Reset mocks
    (useAccount as jest.Mock).mockReturnValue({
      address: null,
      isConnected: false,
    });
    
    (useNetwork as jest.Mock).mockReturnValue({
      chain: null,
    });

    (useDisconnect as jest.Mock).mockReturnValue({
      disconnect: mockDisconnect,
    });

    (getWalletClient as jest.Mock).mockResolvedValue(mockWalletClient);
  });

  it('should initialize with default state', () => {
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

  it('should update wallet state when connected', async () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: '0x123',
      isConnected: true,
    });

    (useNetwork as jest.Mock).mockReturnValue({
      chain: { id: 1 }, // mainnet
    });

    const { result } = renderHook(() => useTokenForgeAuth());

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toMatchObject({
      isConnected: true,
      address: '0x123',
      chainId: 1,
      isCorrectNetwork: true,
    });
  });

  it('should handle admin status correctly', () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    act(() => {
      result.current.login({ email: 'admin@tokenforge.com' } as any);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canCreateToken).toBe(true);
  });

  it('should handle logout and wallet disconnect', () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    act(() => {
      result.current.login({ email: 'user@example.com' } as any);
    });

    act(() => {
      result.current.logout();
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
