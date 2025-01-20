import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { walletReconnectionService } from '../walletReconnectionService';
import { storageService } from '../storageService';
import { getWalletClient, getAccount } from '@wagmi/core';
import { BrowserProvider } from 'ethers';
import { mainnet } from '@wagmi/core/chains';
import { type Connector } from '@wagmi/core';

// Mock des dépendances
vi.mock('@wagmi/core', () => ({
  getWalletClient: vi.fn(),
  getAccount: vi.fn(),
}));

vi.mock('../storageService', () => ({
  storageService: {
    getWalletState: vi.fn(),
    clearWalletState: vi.fn(),
  },
}));

vi.mock('ethers', () => ({
  BrowserProvider: vi.fn(),
}));

describe('WalletReconnectionService', () => {
  const mockAddress = '0x123' as `0x${string}`;
  const mockChainId = 1;
  const mockWalletClient = {
    account: { address: mockAddress },
    chain: { id: mockChainId },
    transport: { type: 'http' },
    type: 'walletClient',
  };

  const mockProvider = new BrowserProvider(window.ethereum);

  // Créer un mock du connecteur avec toutes les méthodes requises
  const mockConnector = {
    id: 'injected',
    name: 'MetaMask',
    type: 'injected',
    uid: 'injected',
    ready: true,
    icon: undefined,
    rdns: undefined,
    supportsSimulation: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getAccounts: vi.fn(),
    getAccount: vi.fn(),
    getChainId: vi.fn(),
    getProvider: vi.fn(),
    getWalletClient: vi.fn(),
    isAuthorized: vi.fn(),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    onMessage: vi.fn(),
    switchChain: vi.fn(),
    watchAsset: vi.fn(),
  } as unknown as Connector;

  const connectedAccountState = {
    address: mockAddress,
    addresses: [mockAddress] as readonly [`0x${string}`],
    chainId: mockChainId,
    chain: mainnet,
    connector: mockConnector,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
    status: 'connected' as const,
  } as const;

  const disconnectedAccountState = {
    address: undefined,
    addresses: undefined,
    chainId: undefined,
    chain: undefined,
    connector: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
    status: 'disconnected' as const,
  } as const;

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();
    
    // Mock de window.ethereum
    global.window.ethereum = {};

    // Configuration des mocks par défaut
    vi.mocked(getWalletClient).mockResolvedValue(mockWalletClient as any);
    vi.mocked(getAccount).mockReturnValue(connectedAccountState as any);

    vi.mocked(BrowserProvider).mockImplementation(() => mockProvider);
    vi.mocked(storageService.getWalletState).mockResolvedValue({
      address: mockAddress,
      chainId: mockChainId,
      isConnected: true,
      isCorrectNetwork: true,
    });
  });

  afterEach(() => {
    walletReconnectionService.cleanup();
    delete global.window.ethereum;
  });

  it('devrait tenter de reconnecter le wallet avec succès', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    expect(onConnect).toHaveBeenCalledWith(
      mockAddress,
      mockChainId,
      expect.anything(),
      expect.anything()
    );
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it('ne devrait pas tenter de reconnecter si aucun état wallet n\'est stocké', async () => {
    vi.mocked(storageService.getWalletState).mockResolvedValue(null);
    
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    expect(onConnect).not.toHaveBeenCalled();
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it('devrait gérer l\'échec de la reconnexion et réessayer', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    
    // Simuler un échec puis un succès
    vi.mocked(getWalletClient)
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce(mockWalletClient as any);

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);
    
    // Attendre le délai de retry
    await new Promise(resolve => setTimeout(resolve, 2100));

    expect(onConnect).toHaveBeenCalledWith(
      mockAddress,
      mockChainId,
      expect.anything(),
      expect.anything()
    );
    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it('devrait déconnecter si le compte change', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    // Simuler un changement de compte
    vi.mocked(getAccount).mockReturnValue(disconnectedAccountState as any);
    
    // Attendre la vérification périodique
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(onDisconnect).toHaveBeenCalled();
  });

  it('devrait gérer le changement de réseau', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const newChainId = 5;

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    // Simuler un changement de réseau
    const newNetworkState = {
      ...connectedAccountState,
      chainId: newChainId,
      chain: {
        ...mainnet,
        id: newChainId,
      },
    };
    vi.mocked(getAccount).mockReturnValue(newNetworkState as any);
    
    // Attendre la vérification périodique
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(onConnect).toHaveBeenCalledWith(
      mockAddress,
      newChainId,
      expect.anything(),
      expect.anything()
    );
  });

  it('devrait gérer le changement de réseau', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const newChainId = 5;

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    // Simuler un changement de réseau
    const newNetworkState = {
      ...connectedAccountState,
      chainId: newChainId,
      chain: {
        ...mainnet,
        id: newChainId,
      },
    };
    vi.mocked(getAccount).mockReturnValue(newNetworkState as any);
    
    // Attendre la vérification périodique
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(onDisconnect).toHaveBeenCalled();
  });

  it('devrait gérer le timeout de connexion', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    // Simuler un timeout
    vi.mocked(getWalletClient).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockWalletClient as any), 11000); // Plus long que CONNECTION_TIMEOUT
      });
    });

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    expect(onConnect).not.toHaveBeenCalled();
    expect(onDisconnect).toHaveBeenCalled();
  });

  it('devrait valider les réseaux supportés', async () => {
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    // Simuler un réseau non supporté
    const unsupportedNetworkState = {
      ...connectedAccountState,
      chainId: 999, // Réseau non supporté
      chain: {
        ...mainnet,
        id: 999,
      },
    };
    vi.mocked(getAccount).mockReturnValue(unsupportedNetworkState as any);

    await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

    expect(onConnect).not.toHaveBeenCalled();
    expect(onDisconnect).toHaveBeenCalled();
  });

  describe('Synchronisation multi-onglets', () => {
    it('devrait synchroniser l\'état du wallet entre les onglets', async () => {
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();

      await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

      // Simuler un message de synchronisation
      const syncMessage = {
        type: 'UPDATE_WALLET_STATE',
        payload: {
          isConnected: true,
          address: '0x456',
          chainId: mockChainId,
        },
        timestamp: Date.now(),
        tabId: 'other-tab',
      };

      // Déclencher l'événement de message
      const messageEvent = new MessageEvent('message', {
        data: syncMessage,
      });
      window.dispatchEvent(messageEvent);

      // Attendre la synchronisation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onConnect).toHaveBeenCalledWith('0x456', mockChainId, expect.anything(), expect.anything());
    });

    it('devrait ignorer les messages de son propre onglet', async () => {
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();

      await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

      // Simuler un message de synchronisation du même onglet
      const syncMessage = {
        type: 'UPDATE_WALLET_STATE',
        payload: {
          isConnected: true,
          address: '0x456',
          chainId: mockChainId,
        },
        timestamp: Date.now(),
        tabId: walletReconnectionService.getCurrentTabId(), // Utiliser l'ID de l'onglet courant
      };

      // Déclencher l'événement de message
      const messageEvent = new MessageEvent('message', {
        data: syncMessage,
      });
      window.dispatchEvent(messageEvent);

      // Attendre la synchronisation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Le onConnect initial ne devrait être appelé qu'une fois
      expect(onConnect).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer la déconnexion synchronisée', async () => {
      const onConnect = vi.fn();
      const onDisconnect = vi.fn();

      await walletReconnectionService.attemptReconnection(onConnect, onDisconnect);

      // Simuler un message de déconnexion
      const syncMessage = {
        type: 'UPDATE_WALLET_STATE',
        payload: {
          isConnected: false,
          address: null,
          chainId: null,
        },
        timestamp: Date.now(),
        tabId: 'other-tab',
      };

      // Déclencher l'événement de message
      const messageEvent = new MessageEvent('message', {
        data: syncMessage,
      });
      window.dispatchEvent(messageEvent);

      // Attendre la synchronisation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onDisconnect).toHaveBeenCalled();
    });
  });
});
