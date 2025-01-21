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
import { renderHook } from '@testing-library/react-hooks';
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

describe('useWalletState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    // Vérifier que les fonctions sont présentes
    expect(typeof result.current.connectWallet).toBe('function');
    expect(typeof result.current.disconnectWallet).toBe('function');
    expect(typeof result.current.updateNetwork).toBe('function');
    expect(typeof result.current.updateProvider).toBe('function');
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

  it('should handle wallet disconnection', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    result.current.disconnectWallet();

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.disconnectWallet()
    );
  });

  it('should handle network update with supported chain', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    const supportedChainId = 1; // mainnet
    result.current.updateNetwork(supportedChainId);

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.updateNetwork(supportedChainId, true)
    );
  });

  it('should handle network update with unsupported chain', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    const unsupportedChainId = 999; // chaîne non supportée
    result.current.updateNetwork(unsupportedChainId);

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.updateNetwork(unsupportedChainId, false)
    );
  });

  it('should handle provider update', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    const mockProvider = { provider: 'test' };
    result.current.updateProvider(mockProvider);

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.updateProvider(mockProvider)
    );
  });

  it('should handle null provider update', () => {
    const { result } = renderHook(() => useWalletState(), {
      wrapper: Wrapper
    });

    result.current.updateProvider(null);

    expect(mockContextValue.dispatch).toHaveBeenCalledWith(
      authActions.updateProvider(null)
    );
  });
});
