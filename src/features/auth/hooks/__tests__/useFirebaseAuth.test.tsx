import { renderHook, act } from '@testing-library/react';
import { useFirebaseAuth } from '../useFirebaseAuth';
import { useAuthManager } from '../useAuthManager';
import { firebaseAuth } from '../../services/firebaseAuth';
import { AuthError } from '../../errors/AuthError';

// Mock des dépendances
vi.mock('../useAuthManager');
vi.mock('../../services/firebaseAuth');

describe('useFirebaseAuth', () => {
  const mockSession = {
    uid: '0x123',
    emailVerified: false,
    email: 'test@tokenforge.eth',
  };

  const mockAccount = '0x123456789';
  const mockProvider = {
    getSigner: vi.fn(),
  };

  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();

    // Mock de useAuthManager
    (useAuthManager as vi.Mock).mockReturnValue({
      account: mockAccount,
      provider: mockProvider,
    });

    // Mock des méthodes de firebaseAuth
    (firebaseAuth.onSessionChange as vi.Mock).mockImplementation((callback) => {
      callback(null);
      return vi.fn();
    });
  });

  it('should initialize with null session and no loading state', () => {
    const { result } = renderHook(() => useFirebaseAuth());

    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful wallet sign in', async () => {
    // Mock de la signature
    const mockSigner = {
      signMessage: vi.fn().mockResolvedValue('mockSignature'),
    };
    mockProvider.getSigner.mockResolvedValue(mockSigner);

    // Mock de la connexion Firebase
    (firebaseAuth.signInWithWallet as vi.Mock).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useFirebaseAuth());

    await act(async () => {
      await result.current.signInWithWallet();
    });

    expect(mockSigner.signMessage).toHaveBeenCalled();
    expect(firebaseAuth.signInWithWallet).toHaveBeenCalledWith(
      mockAccount,
      'mockSignature'
    );
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle sign in error', async () => {
    const mockError = new AuthError('AUTH_003', 'Sign in failed');
    mockProvider.getSigner.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFirebaseAuth());

    await act(async () => {
      try {
        await result.current.signInWithWallet();
      } catch (error) {
        expect((error as AuthError).code).toBe('AUTH_003');
      }
    });

    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle successful sign out', async () => {
    (firebaseAuth.signOut as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirebaseAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle session changes', () => {
    (firebaseAuth.onSessionChange as vi.Mock).mockImplementation((callback) => {
      callback(mockSession);
      return vi.fn();
    });

    const { result } = renderHook(() => useFirebaseAuth());

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle email verification', async () => {
    (firebaseAuth.sendVerificationEmail as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useFirebaseAuth());

    // Simuler une session active
    act(() => {
      (firebaseAuth.onSessionChange as vi.Mock).mock.calls[0][0](mockSession);
    });

    await act(async () => {
      await result.current.sendVerificationEmail();
    });

    expect(firebaseAuth.sendVerificationEmail).toHaveBeenCalled();
  });

  it('should clean up session listener on unmount', () => {
    const mockUnsubscribe = vi.fn();
    (firebaseAuth.onSessionChange as vi.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useFirebaseAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
