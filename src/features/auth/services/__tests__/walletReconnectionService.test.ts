import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWalletClient, watchAccount } from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
import { BrowserProvider } from 'ethers';
import { WalletReconnectionService } from '../walletReconnectionService';
import { storageService } from '../storageService';
import type { WalletClient } from 'viem';

// Mock des services
vi.mock('../storageService');
vi.mock('@wagmi/core');

describe('WalletReconnectionService', () => {
  const mockAddress = '0x123' as `0x${string}`;
  const mockChainId = mainnet.id;
  const mockWalletClient = {
    account: { address: mockAddress },
    chain: { id: mockChainId },
  } as WalletClient;
  const mockProvider = {} as BrowserProvider;

  const connectedAccountState = {
    address: mockAddress,
    chain: mainnet,
    connector: {
      id: 'mock',
      name: 'Mock Wallet',
      type: 'injected'
    },
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
    status: 'connected' as const
  };

  const disconnectedAccountState = {
    address: undefined,
    chain: undefined,
    connector: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
    status: 'disconnected' as const
  };

  const watchAccountCleanup = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Mock de getWalletClient
    vi.mocked(getWalletClient).mockResolvedValue(mockWalletClient);

    // Mock de watchAccount
    vi.mocked(watchAccount).mockImplementation((_config, { onChange }) => {
      setTimeout(() => {
        onChange(connectedAccountState);
      }, 50);
      return watchAccountCleanup;
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('devrait se connecter avec succès', async () => {
    const service = WalletReconnectionService.getInstance();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();

    // Mock de connectWithTimeout
    vi.spyOn(service as any, 'connectWithTimeout').mockResolvedValue({
      walletClient: mockWalletClient,
      provider: mockProvider,
      chainId: mockChainId
    });

    await service.attemptReconnection(onConnect, onDisconnect);
    await vi.advanceTimersByTimeAsync(100);

    expect(onConnect).toHaveBeenCalledWith(
      mockAddress,
      mockChainId,
      expect.anything(),
      expect.anything()
    );
    expect(onDisconnect).not.toHaveBeenCalled();
    expect(storageService.saveWalletState).toHaveBeenCalledWith({
      address: mockAddress,
      chainId: mockChainId,
      isConnected: true,
      isCorrectNetwork: true
    });
  });

  it('devrait gérer le changement de réseau', async () => {
    const service = WalletReconnectionService.getInstance();
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    const unsupportedChainId = 999;

    // Mock initial pour une connexion réussie
    vi.spyOn(service as any, 'connectWithTimeout').mockResolvedValueOnce({
      walletClient: mockWalletClient,
      provider: mockProvider,
      chainId: unsupportedChainId
    });

    await service.attemptReconnection(onConnect, onDisconnect);
    await vi.advanceTimersByTimeAsync(100);

    expect(onDisconnect).toHaveBeenCalled();
    expect(storageService.saveWalletState).toHaveBeenCalledWith({
      isConnected: false,
      chainId: null,
      address: null,
      isCorrectNetwork: false
    });
  });
});
