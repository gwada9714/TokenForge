import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { useAuthState } from '../useAuthState';
import { useWalletState } from '../useWalletState';
import { AuthError } from '../../errors/AuthError';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAccount, useDisconnect, useChainId, useWalletClient, usePublicClient } from 'wagmi';

// Mock des hooks
jest.mock('../useAuthState');
jest.mock('../useWalletState');
jest.mock('wagmi');
jest.mock('firebase/auth');

describe('useTokenForgeAuth', () => {
  // Configuration initiale des mocks
  const mockAuthState = {
    status: 'idle',
    isAuthenticated: false,
    user: null,
    error: null,
    updateUser: jest.fn(),
    startEmailVerification: jest.fn(),
    verifyEmail: jest.fn(),
    logout: jest.fn(),
  };

  const mockWalletState = {
    state: {
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
      walletClient: null,
      provider: null,
    },
    actions: {
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      updateNetwork: jest.fn(),
      updateProvider: jest.fn(),
      updateWalletState: jest.fn(),
    },
  };

  const mockWagmi = {
    address: '0x123',
    isConnected: false,
    chainId: 1,
    walletClient: null,
    provider: null,
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthState as jest.Mock).mockReturnValue(mockAuthState);
    (useWalletState as jest.Mock).mockReturnValue(mockWalletState);
    (useAccount as jest.Mock).mockReturnValue({ address: mockWagmi.address, isConnected: mockWagmi.isConnected });
    (useChainId as jest.Mock).mockReturnValue(mockWagmi.chainId);
    (useWalletClient as jest.Mock).mockReturnValue({ data: mockWagmi.walletClient });
    (usePublicClient as jest.Mock).mockReturnValue(mockWagmi.provider);
    (useDisconnect as jest.Mock).mockReturnValue({ disconnect: mockWagmi.disconnect });
  });

  it('devrait retourner l\'état initial correct', () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    expect(result.current).toEqual({
      status: 'idle',
      isAuthenticated: false,
      user: null,
      error: null,
      emailVerified: false,
      ...mockWalletState.state,
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
      login: expect.any(Function),
      loginWithUser: expect.any(Function),
      logout: expect.any(Function),
      updateUser: expect.any(Function),
      updateWalletState: expect.any(Function),
      startEmailVerification: expect.any(Function),
      verifyEmail: expect.any(Function),
    });
  });

  it('devrait gérer le login avec succès', async () => {
    const mockUser = {
      email: 'test@example.com',
      emailVerified: true,
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });

    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
    expect(mockAuthState.verifyEmail).toHaveBeenCalled();
  });

  it('devrait gérer les erreurs de login', async () => {
    const mockError = new Error('Invalid credentials');
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useTokenForgeAuth());

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong-password');
      })
    ).rejects.toThrow(AuthError);
  });

  it('devrait gérer le logout', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthState.logout).toHaveBeenCalled();
    expect(mockWagmi.disconnect).not.toHaveBeenCalled(); // Car isConnected est false
  });

  it('devrait déconnecter le wallet lors du logout si connecté', async () => {
    (useAccount as jest.Mock).mockReturnValue({ isConnected: true });
    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthState.logout).toHaveBeenCalled();
    expect(mockWagmi.disconnect).toHaveBeenCalled();
  });

  it('devrait mettre à jour l\'état du wallet', () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const newState = { address: '0x456', isConnected: true };

    act(() => {
      result.current.updateWalletState(newState);
    });

    expect(mockWalletState.actions.updateWalletState).toHaveBeenCalledWith(newState);
  });

  it('devrait identifier correctement un admin', () => {
    (useAuthState as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { email: 'admin@tokenforge.com' },
    });

    const { result } = renderHook(() => useTokenForgeAuth());
    expect(result.current.isAdmin).toBe(true);
  });

  it('devrait gérer la vérification d\'email', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.startEmailVerification();
    });

    expect(mockAuthState.startEmailVerification).toHaveBeenCalled();
  });
});
