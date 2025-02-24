import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WalletReconnectionService, AUTH_ACTIONS } from '../walletReconnectionService';
import type { RetryResult } from '../networkRetryService';

// Création des mocks hoistés
const createMockTabSyncService = vi.hoisted(() => ({
  subscribe: vi.fn(),
  broadcast: vi.fn(),
  close: vi.fn()
}));

const createMockStorageService = vi.hoisted(() => ({
  recordNetworkChange: vi.fn()
}));

const createMockNotificationService = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
}));

const createMockNetworkRetryService = vi.hoisted(() => ({
  retryWithTimeout: vi.fn()
}));

// Mock des services
vi.mock('../tabSyncService', () => ({
  tabSyncService: createMockTabSyncService
}));

vi.mock('../storageService', () => ({
  storageService: createMockStorageService
}));

vi.mock('../notificationService', () => ({
  notificationService: createMockNotificationService
}));

vi.mock('../networkRetryService', () => ({
  networkRetryService: createMockNetworkRetryService
}));

// Import des services mockés
import { tabSyncService } from '../tabSyncService';
import { storageService } from '../storageService';
import { notificationService } from '../notificationService';
import { networkRetryService } from '../networkRetryService';

// Mock de BrowserProvider
vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation(() => ({
    // Ajouter les méthodes nécessaires du provider
  }))
}));

// Constantes de test
const TEST_ADDRESS = '0x123';
const TEST_CHAIN_ID = 1;
const POLYGON_CHAIN_ID = 137;

// Mock du provider ethereum
const mockEthereumProvider = {
  request: vi.fn(),
  on: vi.fn((event, callback) => {
    if (event === 'chainChanged') {
      mockEthereumProvider._chainChangedCallback = callback;
    }
    return mockEthereumProvider;
  }),
  removeListener: vi.fn(),
  _chainChangedCallback: null as ((chainId: string) => void) | null
};

describe('WalletReconnectionService', () => {
  let service: WalletReconnectionService;
  let mockCallbacks: {
    onConnect: ReturnType<typeof vi.fn>;
    onDisconnect: ReturnType<typeof vi.fn>;
    onNetworkChange: ReturnType<typeof vi.fn>;
    onProviderChange: ReturnType<typeof vi.fn>;
    onError: ReturnType<typeof vi.fn>;
  };
  let subscribeCallback: (message: any) => void;

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();

    // Setup des mocks des services
    vi.mocked(tabSyncService.subscribe).mockImplementation((callback) => {
      subscribeCallback = callback;
      return () => {};
    });

    // Setup du provider ethereum
    (window as any).ethereum = mockEthereumProvider;
    mockEthereumProvider.request.mockImplementation(async ({ method }: { method: string }) => {
      switch (method) {
        case 'eth_chainId':
          return `0x${TEST_CHAIN_ID.toString(16)}`;
        case 'eth_accounts':
          return [TEST_ADDRESS];
        default:
          return null;
      }
    });

    // Setup des callbacks
    mockCallbacks = {
      onConnect: vi.fn(),
      onDisconnect: vi.fn(),
      onNetworkChange: vi.fn(),
      onProviderChange: vi.fn(),
      onError: vi.fn()
    };

    // Setup du mock de networkRetryService pour le cas par défaut (succès)
    vi.mocked(networkRetryService.retryWithTimeout).mockImplementation(async (fn) => {
      try {
        await fn();
        return { success: true, attempts: 1 } as RetryResult<void>;
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error : new Error(String(error)), 
          attempts: 1 
        } as RetryResult<void>;
      }
    });

    // Création du service
    service = WalletReconnectionService.getInstance();
    service.setCallbacks(mockCallbacks);
  });

  afterEach(() => {
    if (service && service.disconnect) {
      service.disconnect();
    }
    vi.resetAllMocks();
  });

  describe('attemptReconnection', () => {
    it('devrait se reconnecter avec succès', async () => {
      // Exécution
      await service.startReconnection();

      // Vérifications
      expect(mockCallbacks.onConnect).toHaveBeenCalledWith(
        TEST_ADDRESS,
        TEST_CHAIN_ID
      );
      expect(notificationService.success).toHaveBeenCalled();
      expect(tabSyncService.broadcast).toHaveBeenCalledWith(expect.objectContaining({
        type: AUTH_ACTIONS.WALLET_CONNECT,
        payload: expect.objectContaining({
          address: TEST_ADDRESS,
          chainId: TEST_CHAIN_ID,
          isConnected: true
        })
      }));
    });

    it('devrait gérer les erreurs de reconnexion', async () => {
      // Setup
      const error = new Error('Connection failed');
      mockEthereumProvider.request.mockRejectedValue(error);

      // Exécution et vérification
      await expect(service.startReconnection()).rejects.toThrow(error);
      expect(mockCallbacks.onError).toHaveBeenCalledWith(error);
      expect(notificationService.error).toHaveBeenCalled();
    });
  });

  describe('setupNetworkChangeListener', () => {
    it('devrait gérer les changements de réseau', async () => {
      // Setup
      const newChainId = POLYGON_CHAIN_ID;
      await service.startReconnection();

      // Simuler un changement de réseau
      mockEthereumProvider.request.mockImplementation(async ({ method }: { method: string }) => {
        switch (method) {
          case 'eth_chainId':
            return `0x${newChainId.toString(16)}`;
          case 'eth_accounts':
            return [TEST_ADDRESS];
          default:
            return null;
        }
      });

      // Déclencher le changement de réseau
      if (mockEthereumProvider._chainChangedCallback) {
        await mockEthereumProvider._chainChangedCallback(`0x${newChainId.toString(16)}`);
        
        // Attendre que les callbacks soient appelés
        await vi.waitFor(async () => {
          expect(mockCallbacks.onNetworkChange).toHaveBeenCalledWith(newChainId);
          expect(storageService.recordNetworkChange).toHaveBeenCalled();
          expect(tabSyncService.broadcast).toHaveBeenCalledWith(expect.objectContaining({
            type: AUTH_ACTIONS.WALLET_NETWORK_CHANGE,
            payload: expect.objectContaining({
              chainId: newChainId
            })
          }));
        });
      }
    });
  });

  describe('setupTabSync', () => {
    it('devrait synchroniser l\'état du wallet entre les onglets', async () => {
      // Setup
      const mockMessage = {
        type: AUTH_ACTIONS.WALLET_CONNECT,
        payload: {
          address: TEST_ADDRESS,
          chainId: TEST_CHAIN_ID,
          isConnected: true
        },
        timestamp: Date.now(),
        tabId: 'other-tab'
      };

      // Simuler un message de synchronisation
      if (subscribeCallback) {
        subscribeCallback(mockMessage);

        // Vérifications
        expect(mockCallbacks.onConnect).toHaveBeenCalledWith(
          TEST_ADDRESS,
          TEST_CHAIN_ID
        );
      }
    });
  });
});
