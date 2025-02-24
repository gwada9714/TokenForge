import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { useAuthState } from '../useAuthState';
import { useWalletState } from '../useWalletState';
import { AuthError } from '../../errors/AuthError';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAccount, useDisconnect, useChainId, useWalletClient, usePublicClient } from 'wagmi';

// Mock des hooks
vi.mock('../useAuthState');
vi.mock('../useWalletState');
vi.mock('wagmi');
vi.mock('firebase/auth');

describe('useTokenForgeAuth', () => {
  // Configuration initiale des mocks
  const mockAuthState = {
    status: 'idle',
    isAuthenticated: false,
    user: null,
    error: null,
    updateUser: vi.fn(),
    startEmailVerification: vi.fn(),
    verifyEmail: vi.fn(),
    logout: vi.fn(),
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
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      updateNetwork: vi.fn(),
      updateProvider: vi.fn(),
      updateWalletState: vi.fn(),
    },
  };

  const mockWagmi = {
    address: '0x123',
    isConnected: false,
    chainId: 1,
    walletClient: null,
    provider: null,
    disconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthState as vi.Mock).mockReturnValue(mockAuthState);
    (useWalletState as vi.Mock).mockReturnValue(mockWalletState);
    (useAccount as vi.Mock).mockReturnValue({ address: mockWagmi.address, isConnected: mockWagmi.isConnected });
    (useChainId as vi.Mock).mockReturnValue(mockWagmi.chainId);
    (useWalletClient as vi.Mock).mockReturnValue({ data: mockWagmi.walletClient });
    (usePublicClient as vi.Mock).mockReturnValue(mockWagmi.provider);
    (useDisconnect as vi.Mock).mockReturnValue({ disconnect: mockWagmi.disconnect });
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

    (signInWithEmailAndPassword as vi.Mock).mockResolvedValueOnce({
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
    (signInWithEmailAndPassword as vi.Mock).mockRejectedValueOnce(mockError);

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
    (useAccount as vi.Mock).mockReturnValue({ isConnected: true });
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
    (useAuthState as vi.Mock).mockReturnValue({
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
