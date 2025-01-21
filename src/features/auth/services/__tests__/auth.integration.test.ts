import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import services first
import { walletReconnectionService, AUTH_ACTIONS } from '../walletReconnectionService';
import { networkRetryService } from '../networkRetryService';
import { useAuthState } from '../../hooks/useAuthState';
import { useWalletState } from '../../hooks/useWalletState';
import type { WalletCallbacks, BaseWalletState } from '../walletReconnectionService';
import type { TokenForgeUser, AuthStatus } from '../../types/auth';
import type { WalletClientType } from '../../types';

// Mock des chaînes
vi.mock('../../../../config/chains', () => ({
  mainnet: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth-mainnet.mock.rpc'] },
      public: { http: ['https://eth-mainnet.mock.rpc'] }
    }
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth-sepolia.mock.rpc'] },
      public: { http: ['https://eth-sepolia.mock.rpc'] }
    }
  },
  defaultChain: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet'
  }
}));

// Mock tabSyncService
vi.mock('../tabSyncService', () => ({
  tabSyncService: {
    broadcast: vi.fn((message) => {
      // Simuler le comportement de BroadcastChannel
      const event = new MessageEvent('message', {
        data: {
          ...message,
          timestamp: Date.now()
        }
      });
      // Déclencher l'événement immédiatement
      window.dispatchEvent(event);
    }),
    subscribe: vi.fn((callback) => {
      // Ajouter l'écouteur d'événements
      window.addEventListener('message', (event) => callback(event.data));
      // Retourner une fonction de nettoyage
      return () => {
        window.removeEventListener('message', (event) => callback(event.data));
      };
    })
  }
}));

// Mock networkRetryService
vi.mock('../networkRetryService', () => ({
  networkRetryService: {
    retryWithTimeout: vi.fn().mockImplementation(async (operation) => {
      try {
        const result = await operation();
        return { success: true, result, attempts: 1 };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error : new Error(String(error)), 
          attempts: 1 
        };
      }
    })
  }
}));

// Création des mocks hoistés
const createMockGoogleAuthProvider = vi.hoisted(() => ({
  addScope: vi.fn().mockReturnThis(),
  setCustomParameters: vi.fn().mockReturnThis()
}));

const mockEthereumProvider = {
  request: vi.fn().mockImplementation(async (params: { method: string }) => {
    switch (params.method) {
      case 'eth_chainId':
        return '0x1';
      case 'eth_accounts':
        return ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      default:
        return null;
    }
  })
};

// Mock modules
vi.mock('../../../../config/firebase', () => ({
  auth: {
    currentUser: null,
    signOut: vi.fn()
  }
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: createMockGoogleAuthProvider,
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn((_, callback) => {
    callback(null);
    return vi.fn();
  }),
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({
    currentUser: null,
    signOut: vi.fn()
  }))
}));

// Mock hooks
vi.mock('../../hooks/useAuthState', () => ({
  useAuthState: vi.fn().mockReturnValue({
    status: 'idle' as AuthStatus,
    isAuthenticated: false,
    user: null as TokenForgeUser | null,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    dispatch: vi.fn()
  })
}));

vi.mock('../../hooks/useWalletState', () => ({
  useWalletState: vi.fn().mockReturnValue({
    address: null as string | null,
    chainId: null as number | null,
    isConnected: false,
    provider: null,
    walletClient: null as WalletClientType | null,
    isCorrectNetwork: false,
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    updateNetwork: vi.fn(),
    updateProvider: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn()
  })
}));

// Mock autres services
vi.mock('ethers');
vi.mock('viem');

// Mock implementations
const mockedUseAuthState = vi.mocked(useAuthState);
const mockedUseWalletState = vi.mocked(useWalletState);

describe('Auth Integration Tests', () => {
  // Mock data
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const mockChainId = 1;

  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    walletReconnectionService.disconnect();

    // Assigner le mock provider
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereumProvider,
      writable: true,
      configurable: true
    });
  });

  describe('Flux d\'authentification complet', () => {
    it('devrait gérer le flux complet de connexion wallet et authentification', async () => {
      // Setup des mocks
      const mockAuthState = {
        status: 'idle' as AuthStatus,
        isAuthenticated: false,
        user: null as TokenForgeUser | null,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        dispatch: vi.fn()
      };

      const mockWalletState = {
        address: null as string | null,
        chainId: null as number | null,
        isConnected: false,
        provider: null,
        walletClient: null as WalletClientType | null,
        isCorrectNetwork: false,
        connectWallet: vi.fn(),
        disconnectWallet: vi.fn(),
        updateNetwork: vi.fn(),
        updateProvider: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn()
      };

      // Mock des hooks
      mockedUseAuthState.mockReturnValue(mockAuthState);
      mockedUseWalletState.mockReturnValue(mockWalletState);

      // Définir les callbacks
      const callbacks: WalletCallbacks = {
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
        onNetworkChange: vi.fn(),
        onProviderChange: vi.fn(),
      };

      walletReconnectionService.setCallbacks(callbacks);

      await walletReconnectionService.startReconnection();

      // Vérification de la mise à jour du wallet
      const state = walletReconnectionService.getWalletState();
      expect(state.address).toBe(mockAddress);
      expect(state.chainId).toBe(mockChainId);
      expect(state.isConnected).toBe(true);

      // Vérification des callbacks
      expect(callbacks.onConnect).toHaveBeenCalledWith(mockAddress, mockChainId);
    });

    it('devrait gérer correctement la déconnexion', () => {
      // Définir les callbacks
      const callbacks: WalletCallbacks = {
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
        onNetworkChange: vi.fn(),
        onProviderChange: vi.fn(),
      };

      walletReconnectionService.setCallbacks(callbacks);

      // Test de la déconnexion
      walletReconnectionService.disconnect();

      // Vérification de l'état
      const state = walletReconnectionService.getWalletState();
      expect(state).toEqual({
        address: null,
        chainId: null,
        isConnected: false,
        provider: null,
        walletClient: null,
      });

      // Vérification du callback
      expect(callbacks.onDisconnect).toHaveBeenCalled();
    });
  });

  describe('Synchronisation des états', () => {
    it('devrait synchroniser les états entre les onglets', async () => {
      const callbacks: WalletCallbacks = {
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
        onNetworkChange: vi.fn(),
        onProviderChange: vi.fn(),
        onWalletStateSync: vi.fn(),
      };

      walletReconnectionService.setCallbacks(callbacks);

      // Simuler un message de synchronisation d'un autre onglet
      const mockState: BaseWalletState = {
        address: mockAddress,
        chainId: mockChainId,
        isConnected: true
      };

      // Simuler un message de synchronisation
      const mockMessage = {
        type: AUTH_ACTIONS.WALLET_CONNECT,
        payload: mockState,
        timestamp: Date.now(),
        tabId: 'mock-tab-id',
        priority: 800
      };

      // Simuler directement l'événement de message
      const event = new MessageEvent('message', {
        data: mockMessage
      });

      // Déclencher l'événement
      window.dispatchEvent(event);

      // Attendre que le callback soit appelé
      await vi.waitFor(() => {
        expect(callbacks.onWalletStateSync).toHaveBeenCalledWith(mockState);
      }, { timeout: 1000, interval: 50 });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de reconnexion', async () => {
      const callbacks: WalletCallbacks = {
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
        onNetworkChange: vi.fn(),
        onProviderChange: vi.fn(),
        onError: vi.fn(),
      };

      walletReconnectionService.setCallbacks(callbacks);

      // Créer un mock provider avec une erreur
      const mockProviderWithError = {
        request: vi.fn().mockImplementation(async ({ method }: { method: string }) => {
          if (method === 'eth_chainId') {
            return '0x1';
          }
          if (method === 'eth_accounts') {
            throw new Error('Failed to connect');
          }
          return null;
        })
      };

      // Assigner le mock provider avec erreur
      Object.defineProperty(window, 'ethereum', {
        value: mockProviderWithError,
        writable: true,
        configurable: true
      });

      // Mock retryWithTimeout pour utiliser notre configuration
      vi.mocked(networkRetryService.retryWithTimeout).mockImplementationOnce(
        async (operation) => {
          try {
            const result = await operation();
            return { success: true, result, attempts: 1 };
          } catch (error) {
            throw error;
          }
        }
      );

      // Tenter la reconnexion
      await expect(walletReconnectionService.startReconnection()).rejects.toThrow();

      // Vérifier que networkRetryService a été appelé
      expect(networkRetryService.retryWithTimeout).toHaveBeenCalled();

      // Vérifier que l'état est correct
      const state = walletReconnectionService.getWalletState();
      expect(state.isConnected).toBe(false);
      expect(state.address).toBe(null);
      expect(state.chainId).toBe(null);
      expect(state.provider).toBe(null);
      expect(state.walletClient).toBe(null);
    });
  });
});
