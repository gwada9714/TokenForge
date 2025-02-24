// Mock de chains.ts avec configuration complète
vi.mock('../../../config/chains', () => {
  const mockMainnet = {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth-mainnet.mock.local'] },
      public: { http: ['https://eth-mainnet.mock.local'] }
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' }
    }
  };
  
  const mockSepolia = {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth-sepolia.mock.local'] },
      public: { http: ['https://eth-sepolia.mock.local'] }
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' }
    }
  };

  return {
    mainnet: mockMainnet,
    sepolia: mockSepolia,
    getRpcUrl: vi.fn().mockImplementation((chainId: number) => {
      if (chainId === 1) return 'https://eth-mainnet.mock.local';
      if (chainId === 11155111) return 'https://eth-sepolia.mock.local';
      return '';
    }),
    getContractAddress: vi.fn().mockImplementation((chainId: number) => {
      if (chainId === 1) return mockEnv.VITE_TOKEN_FACTORY_MAINNET;
      if (chainId === 11155111) return mockEnv.VITE_TOKEN_FACTORY_SEPOLIA;
      return '';
    }),
    isChainSupported: vi.fn().mockImplementation((chainId: number) => 
      [1, 11155111].includes(chainId)
    )
  };
});

// Imports nécessaires pour les tests
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import type { WalletState, TokenForgeAuthState } from '../../types/auth';
import { TokenForgeAuthContext } from '../../context/TokenForgeAuthContext';
import { useWalletState } from '../useWalletState';
import { authActions } from '../../actions/authActions';
import type { AuthAction } from '../../actions/authActions';

// Mock des variables d'environnement
vi.mock('vite', () => ({
  defineConfig: vi.fn()
}));

// Définir les variables d'environnement
const mockEnv = {
  VITE_TOKEN_FACTORY_MAINNET: '0x1234567890123456789012345678901234567890',
  VITE_TOKEN_FACTORY_SEPOLIA: '0x1234567890123456789012345678901234567890'
};

Object.defineProperty(import.meta, 'env', {
  value: mockEnv
});

// Imports après les mocks d'environnement

// Définir les constantes de chaînes
const mockMainnet = {
  id: 1,
  name: 'Ethereum Mainnet',
  network: 'mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://eth-mainnet.example.com'] }
  }
};

const mockSepolia = {
  id: 11155111,
  name: 'Sepolia Testnet',
  network: 'sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.example.com'] }
  }
};

// Mock de viem/chains
vi.mock('viem/chains', () => ({
  mainnet: mockMainnet,
  sepolia: mockSepolia
}));

// Mock des services
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

vi.mock('../../services/walletReconnectionService', () => ({
  walletReconnectionService: {
    initialize: vi.fn(() => () => {})
  }
}));

// Types et interfaces
interface WrapperProps {
  children: React.ReactNode;
}

const mockWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  isCorrectNetwork: false,
  walletClient: null,
  provider: null
};

interface TokenForgeAuthContextType extends TokenForgeAuthState {
  dispatch: React.Dispatch<AuthAction>;
}

const mockContextValue: TokenForgeAuthContextType = {
  status: 'idle',
  isAuthenticated: false,
  user: null,
  walletState: mockWalletState,
  error: null,
  isAdmin: false,
  canCreateToken: false,
  canUseServices: false,
  dispatch: vi.fn()
};

// Mock du hook useTokenForgeAuth
vi.mock('../useTokenForgeAuth', () => ({
  useTokenForgeAuth: () => mockContextValue
}));

// Wrapper pour le contexte
const Wrapper = ({ children }: WrapperProps) => (
  <TokenForgeAuthContext.Provider value={mockContextValue}>
    {children}
  </TokenForgeAuthContext.Provider>
);

import { useAccount, useNetwork, useSignMessage } from 'wagmi';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useNetwork: vi.fn(),
  useSignMessage: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWalletState } from '../useWalletState';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { WalletClient, PublicClient, Address, Chain } from 'viem';

// Mock Viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  createWalletClient: vi.fn(),
  http: vi.fn(),
  custom: vi.fn()
}));

vi.mock('viem/chains', () => ({
  mainnet: { id: 1, name: 'Ethereum' }
}));

describe('useWalletState', () => {
  let mockStore: any;
  let mockPublicClient: Partial<PublicClient>;
  let mockWalletClient: Partial<WalletClient>;
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
  const mockChainId = 1;

  beforeEach(() => {
    mockPublicClient = {
      chain: mainnet,
      request: vi.fn()
    };

    mockWalletClient = {
      account: {
        address: mockAddress,
        type: 'json-rpc'
      },
      chain: mainnet,
      request: vi.fn()
    };

    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient as PublicClient);
    vi.mocked(createWalletClient).mockReturnValue(mockWalletClient as WalletClient);
    vi.mocked(http).mockReturnValue({} as any);
    vi.mocked(custom).mockReturnValue({} as any);

    mockStore = configureStore({
      reducer: {
        auth: authReducer
      },
      preloadedState: {
        auth: {
          walletState: {
            isConnected: false,
            address: null,
            chainId: null,
            isCorrectNetwork: false
          }
        }
      }
    });
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.isCorrectNetwork).toBe(false);
  });

  it('connects wallet successfully', async () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe(mockAddress);
    expect(result.current.chainId).toBe(mockChainId);
    expect(result.current.isCorrectNetwork).toBe(true);
  });

  it('handles wallet connection errors', async () => {
    const mockError = new Error('Connection failed');
    vi.mocked(createWalletClient).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeDefined();
  });

  it('disconnects wallet', async () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    // First connect
    await act(async () => {
      await result.current.connect();
    });

    // Then disconnect
    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.isCorrectNetwork).toBe(false);
  });

  it('handles network changes', async () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    // Connect first
    await act(async () => {
      await result.current.connect();
    });

    // Simulate network change
    const newChain: Chain = {
      ...mainnet,
      id: 5, // Goerli testnet
      name: 'Goerli'
    };

    await act(async () => {
      mockWalletClient.chain = newChain;
      // Trigger network change event
      window.dispatchEvent(new Event('chainChanged'));
    });

    expect(result.current.chainId).toBe(5);
    expect(result.current.isCorrectNetwork).toBe(false);
  });

  it('handles account changes', async () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    // Connect first
    await act(async () => {
      await result.current.connect();
    });

    // Simulate account change
    const newAddress = '0x9876543210987654321098765432109876543210' as Address;

    await act(async () => {
      if (mockWalletClient.account) {
        mockWalletClient.account.address = newAddress;
      }
      // Trigger account change event
      window.dispatchEvent(new Event('accountsChanged'));
    });

    expect(result.current.address).toBe(newAddress);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWalletState(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      )
    });

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
  });
});
