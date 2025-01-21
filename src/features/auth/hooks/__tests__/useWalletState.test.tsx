// Mock des variables d'environnement avant tout
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
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import type { WalletState, TokenForgeAuthState } from '../../types/auth';
import { TokenForgeAuthContext } from '../../context/TokenForgeAuthContext';
import { useWalletState } from '../useWalletState';
import { authActions } from '../../actions/authActions';
import type { AuthAction } from '../../actions/authActions';

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

// Mock de config/chains
vi.mock('../../../config/chains', () => ({
  supportedChains: [mockMainnet, mockSepolia],
  supportedChainIds: [1, 11155111],
  defaultChain: mockSepolia,
  getContractAddress: (chainId: number) => {
    if (chainId === 1) return mockEnv.VITE_TOKEN_FACTORY_MAINNET as `0x${string}`;
    if (chainId === 11155111) return mockEnv.VITE_TOKEN_FACTORY_SEPOLIA as `0x${string}`;
    return null;
  },
  getRpcUrl: (chainId: number) => {
    if (chainId === 1) return mockMainnet.rpcUrls.default.http[0];
    if (chainId === 11155111) return mockSepolia.rpcUrls.default.http[0];
    throw new Error(`Chaîne ID ${chainId} non supportée`);
  },
  isChainSupported: (chainId: number) => [1, 11155111].includes(chainId)
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

describe('useWalletState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    expect(result.current).toEqual({
      connectWallet: expect.any(Function),
      disconnectWallet: expect.any(Function),
      updateNetwork: expect.any(Function),
      updateProvider: expect.any(Function)
    });
  });

  it('should handle wallet connection', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockChainId = 1;
    const mockWalletClient = {};
    const mockProvider = {};

    result.current.connectWallet(mockAddress, mockChainId, mockWalletClient, mockProvider);

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.connectWallet({
        isConnected: true,
        address: mockAddress,
        chainId: mockChainId,
        walletClient: mockWalletClient,
        provider: mockProvider,
        isCorrectNetwork: true
      })
    );
  });
});
