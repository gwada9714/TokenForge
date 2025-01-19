import { renderHook, act } from '@testing-library/react';
import { useWalletState } from '../hooks/useWalletState';
import { getWalletClient } from '@wagmi/core';

// Mock getWalletClient
jest.mock('@wagmi/core', () => ({
  getWalletClient: jest.fn(),
}));

describe('useWalletState', () => {
  const mockWalletClient = {} as Awaited<ReturnType<typeof getWalletClient>>;
  
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWalletState());
    
    expect(result.current.state).toEqual({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      walletClient: null,
    });
  });

  it('should update state on wallet connect', () => {
    const { result } = renderHook(() => useWalletState());
    const mockAddress = '0x123';
    const mockChainId = 1;

    act(() => {
      result.current.actions.connectWallet(
        mockAddress,
        mockChainId,
        mockWalletClient,
        true
      );
    });

    expect(result.current.state).toEqual({
      isConnected: true,
      address: mockAddress,
      chainId: mockChainId,
      isCorrectNetwork: true,
      walletClient: mockWalletClient,
    });
  });

  it('should clear state on wallet disconnect', () => {
    const { result } = renderHook(() => useWalletState());
    const mockAddress = '0x123';
    const mockChainId = 1;

    act(() => {
      result.current.actions.connectWallet(
        mockAddress,
        mockChainId,
        mockWalletClient,
        true
      );
    });

    act(() => {
      result.current.actions.disconnectWallet();
    });

    expect(result.current.state).toEqual({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      walletClient: null,
    });
  });

  it('should handle network changes', () => {
    const { result } = renderHook(() => useWalletState());
    const mockAddress = '0x123';
    const initialChainId = 1;
    const newChainId = 5;

    act(() => {
      result.current.actions.connectWallet(
        mockAddress,
        initialChainId,
        mockWalletClient,
        true
      );
    });

    act(() => {
      result.current.actions.updateNetwork(newChainId, false);
    });

    expect(result.current.state).toEqual({
      isConnected: true,
      address: mockAddress,
      chainId: newChainId,
      isCorrectNetwork: false,
      walletClient: mockWalletClient,
    });
  });
});
