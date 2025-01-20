import { renderHook, act } from '@testing-library/react-hooks';
import { useWalletState } from '../useWalletState';
import { notificationService } from '../../services/notificationService';
import { mainnet, sepolia } from '../../../../config/chains';

jest.mock('../../services/notificationService');

describe('useWalletState', () => {
  const mockWalletClient = { id: 'mock-wallet' };
  const mockProvider = { id: 'mock-provider' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait retourner l\'état initial correct', () => {
    const { result } = renderHook(() => useWalletState());

    expect(result.current.state).toEqual({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      walletClient: null,
      provider: null,
    });
  });

  it('devrait connecter le wallet', () => {
    const { result } = renderHook(() => useWalletState());
    const address = '0x123';
    const chainId = mainnet.id;

    act(() => {
      result.current.actions.connectWallet(address, chainId, mockWalletClient, mockProvider);
    });

    expect(result.current.state).toEqual({
      isConnected: true,
      address,
      chainId,
      isCorrectNetwork: true,
      walletClient: mockWalletClient,
      provider: mockProvider,
    });
    expect(notificationService.notifyWalletConnected).toHaveBeenCalledWith(address);
  });

  it('devrait déconnecter le wallet', () => {
    const { result } = renderHook(() => useWalletState());
    
    // D'abord connecter
    act(() => {
      result.current.actions.connectWallet('0x123', mainnet.id, mockWalletClient, mockProvider);
    });

    // Puis déconnecter
    act(() => {
      result.current.actions.disconnectWallet();
    });

    expect(result.current.state).toEqual({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      walletClient: null,
      provider: null,
    });
    expect(notificationService.notifyWalletDisconnected).toHaveBeenCalled();
  });

  it('devrait mettre à jour le réseau', () => {
    const { result } = renderHook(() => useWalletState());
    const chainId = sepolia.id;

    act(() => {
      result.current.actions.updateNetwork(chainId);
    });

    expect(result.current.state.chainId).toBe(chainId);
    expect(result.current.state.isCorrectNetwork).toBe(true);
  });

  it('devrait mettre à jour le provider', () => {
    const { result } = renderHook(() => useWalletState());

    act(() => {
      result.current.actions.updateProvider(mockProvider);
    });

    expect(result.current.state.provider).toBe(mockProvider);
  });

  it('devrait mettre à jour partiellement l\'état du wallet', () => {
    const { result } = renderHook(() => useWalletState());
    const newState = {
      address: '0x456',
      isConnected: true,
    };

    act(() => {
      result.current.actions.updateWalletState(newState);
    });

    expect(result.current.state).toEqual({
      ...result.current.state,
      ...newState,
    });
  });

  it('devrait préserver les propriétés non modifiées lors de la mise à jour partielle', () => {
    const { result } = renderHook(() => useWalletState());
    
    // D'abord définir un état complet
    act(() => {
      result.current.actions.connectWallet('0x123', mainnet.id, mockWalletClient, mockProvider);
    });

    const initialState = result.current.state;
    const partialUpdate = {
      address: '0x456',
    };

    // Puis faire une mise à jour partielle
    act(() => {
      result.current.actions.updateWalletState(partialUpdate);
    });

    expect(result.current.state).toEqual({
      ...initialState,
      ...partialUpdate,
    });
  });

  it('devrait notifier d\'un mauvais réseau', () => {
    const { result } = renderHook(() => useWalletState());
    const wrongChainId = 999;

    act(() => {
      result.current.actions.connectWallet('0x123', wrongChainId, mockWalletClient, mockProvider);
    });

    expect(notificationService.notifyWrongNetwork).toHaveBeenCalled();
    expect(result.current.state.isCorrectNetwork).toBe(false);
  });
});
