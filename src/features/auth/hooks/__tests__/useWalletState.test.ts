import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useWalletState } from '../useWalletState';
import { TokenForgeAuthContext } from '../../context/TokenForgeAuthContext';
import { AuthStatus, TokenForgeAuthContextValue, WalletState } from '../../types';
import type { Mock } from 'vitest';

// Mock des chaînes
const mockChains = {
  mainnet: {
    id: 1,
    name: 'Ethereum Mainnet'
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia Testnet'
  }
};

vi.mock('../../../config/chains', () => mockChains);

// Mocks des services
vi.mock('../../services/walletReconnectionService', () => ({
  walletReconnectionService: {
    initialize: vi.fn(),
    cleanup: vi.fn()
  }
}));

vi.mock('../../services/notificationService', () => ({
  notificationService: {
    notifyWalletConnected: vi.fn(),
    notifyWalletDisconnected: vi.fn(),
    notifyWrongNetwork: vi.fn()
  }
}));

vi.mock('../../services/storageService', () => ({
  storageService: {
    saveWalletState: vi.fn(),
    clearWalletState: vi.fn()
  }
}));

const mockDispatch = vi.fn() as Mock;

const mockWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  provider: null,
  walletClient: null
};

const mockAuthContextValue: TokenForgeAuthContextValue = {
  dispatch: mockDispatch,
  status: 'idle',
  isAuthenticated: false,
  user: null,
  error: null,
  walletState: mockWalletState
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TokenForgeAuthContext.Provider value={mockAuthContextValue}>
    {children}
  </TokenForgeAuthContext.Provider>
);

describe('useWalletState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait initialiser avec l\'état par défaut', () => {
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });
    
    expect(result.current).toEqual({
      connectWallet: expect.any(Function),
      disconnectWallet: expect.any(Function),
      updateNetwork: expect.any(Function),
      updateProvider: expect.any(Function),
      ...mockWalletState
    });
  });

  it('devrait gérer la connexion du wallet sur Ethereum Mainnet', async () => {
    const mockAddress = '0x123';
    const mockWalletClient = { address: mockAddress };
    const mockProvider = {};
    
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.connectWallet(mockAddress, mockChains.mainnet.id, mockWalletClient, mockProvider);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'wallet/connect',
      payload: {
        isConnected: true,
        address: mockAddress,
        chainId: mockChains.mainnet.id,
        walletClient: mockWalletClient,
        provider: mockProvider,
        isCorrectNetwork: true
      }
    });
  });

  it('devrait gérer la connexion du wallet sur un réseau non supporté', async () => {
    const mockAddress = '0x123';
    const mockWalletClient = { address: mockAddress };
    const mockProvider = {};
    const wrongChainId = 1337;
    
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.connectWallet(mockAddress, wrongChainId, mockWalletClient, mockProvider);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'wallet/connect',
      payload: {
        isConnected: true,
        address: mockAddress,
        chainId: wrongChainId,
        walletClient: mockWalletClient,
        provider: mockProvider,
        isCorrectNetwork: false
      }
    });
  });

  it('devrait gérer la déconnexion du wallet', async () => {
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.disconnectWallet();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'wallet/disconnect'
    });
  });

  it('devrait gérer le changement de réseau', async () => {
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.updateNetwork(mockChains.sepolia.id);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'wallet/updateNetwork',
      payload: {
        chainId: mockChains.sepolia.id,
        isCorrectNetwork: true
      }
    });
  });

  it('devrait gérer la mise à jour du provider', async () => {
    const mockProvider = { test: 'provider' };
    const { result } = renderHook(() => useWalletState(), { wrapper: Wrapper });

    await act(async () => {
      result.current.updateProvider(mockProvider);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'wallet/updateProvider',
      payload: mockProvider
    });
  });
});
