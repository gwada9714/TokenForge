import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { useAuthState } from '../useAuthState';
import { useWalletState } from '../useWalletState';
import { useEmailVerification } from '../useEmailVerification';
import { TokenForgeUser } from '../../types';
import { UserMetadata } from 'firebase/auth';

// Mocks
jest.mock('../useAuthState');
jest.mock('../useWalletState');
jest.mock('../useEmailVerification');

describe('useTokenForgeAuth', () => {
  // Mock implementations
  const mockAuthState = {
    state: {
      isAuthenticated: false,
      user: null,
      status: 'idle',
      error: null,
      emailVerified: false,
    },
    actions: {
      handleAuthStart: jest.fn(),
      handleAuthSuccess: jest.fn(),
      handleAuthError: jest.fn(),
      handleLogout: jest.fn(),
      handleEmailVerificationStart: jest.fn(),
      handleEmailVerificationSuccess: jest.fn(),
      handleEmailVerificationFailure: jest.fn(),
      handleUpdateUser: jest.fn(),
    },
  };

  const mockWalletState = {
    state: {
      isConnected: false,
      address: null,
      chainId: null,
      walletClient: null,
      isCorrectNetwork: false,
      provider: null,
    },
    actions: {
      handleConnect: jest.fn(),
      handleDisconnect: jest.fn(),
      handleNetworkChange: jest.fn(),
      handleAccountChange: jest.fn(),
    },
  };

  const mockEmailVerification = {
    sendVerificationEmail: jest.fn(),
    checkVerificationStatus: jest.fn(),
  };

  const createMockUser = (overrides: Partial<TokenForgeUser> = {}): TokenForgeUser => ({
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: false,
    isAnonymous: false,
    metadata: {} as UserMetadata,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    isAdmin: false,
    customMetadata: {},
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthState as jest.Mock).mockReturnValue(mockAuthState);
    (useWalletState as jest.Mock).mockReturnValue(mockWalletState);
    (useEmailVerification as jest.Mock).mockReturnValue(mockEmailVerification);
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const auth = result.current;

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(auth.status).toBe('idle');
    expect(auth.error).toBeNull();
    expect(auth.emailVerified).toBe(false);
    expect(auth.isAdmin).toBe(false);
    expect(auth.canCreateToken).toBe(false);
    expect(auth.canUseServices).toBe(false);
  });

  it('should handle login process', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const credentials = { email: 'test@example.com', password: 'password123' };

    await act(async () => {
      await result.current.login(credentials.email, credentials.password);
    });

    expect(mockAuthState.actions.handleAuthStart).toHaveBeenCalled();
  });

  it('should handle email verification', async () => {
    const mockUser = createMockUser({
      email: 'test@example.com',
      emailVerified: false,
    });

    // Mettre à jour l'état mockAuthState sans modifier directement user
    const updatedAuthState = {
      ...mockAuthState,
      state: {
        ...mockAuthState.state,
        user: mockUser,
        isAuthenticated: true,
      },
    };
    (useAuthState as jest.Mock).mockReturnValue(updatedAuthState);

    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.verifyEmail(mockUser);
    });

    expect(mockEmailVerification.sendVerificationEmail).toHaveBeenCalled();
    expect(mockAuthState.actions.handleEmailVerificationStart).toHaveBeenCalled();
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthState.actions.handleLogout).toHaveBeenCalled();
    expect(mockWalletState.actions.handleDisconnect).toHaveBeenCalled();
  });

  describe('User Permissions', () => {
    it('should handle admin permissions correctly', () => {
      const adminUser = createMockUser({
        email: 'admin@example.com',
        emailVerified: true,
        isAdmin: true,
      });

      const updatedAuthState = {
        ...mockAuthState,
        state: {
          ...mockAuthState.state,
          user: adminUser,
          isAuthenticated: true,
        },
      };
      (useAuthState as jest.Mock).mockReturnValue(updatedAuthState);

      const updatedWalletState = {
        ...mockWalletState,
        state: {
          ...mockWalletState.state,
          isConnected: true,
          isCorrectNetwork: true,
        },
      };
      (useWalletState as jest.Mock).mockReturnValue(updatedWalletState);

      const { result } = renderHook(() => useTokenForgeAuth());
      const auth = result.current;

      expect(auth.isAdmin).toBe(true);
      expect(auth.canCreateToken).toBe(true);
      expect(auth.canUseServices).toBe(true);
    });

    it('should handle regular user permissions correctly', () => {
      const regularUser = createMockUser({
        email: 'user@example.com',
        emailVerified: true,
        isAdmin: false,
      });

      const updatedAuthState = {
        ...mockAuthState,
        state: {
          ...mockAuthState.state,
          user: regularUser,
          isAuthenticated: true,
        },
      };
      (useAuthState as jest.Mock).mockReturnValue(updatedAuthState);

      const { result } = renderHook(() => useTokenForgeAuth());
      const auth = result.current;

      expect(auth.isAdmin).toBe(false);
      expect(auth.canCreateToken).toBe(true);
      expect(auth.canUseServices).toBe(true);
    });

    it('should handle unverified user permissions', () => {
      const unverifiedUser = createMockUser({
        email: 'unverified@example.com',
        emailVerified: false,
      });

      const updatedAuthState = {
        ...mockAuthState,
        state: {
          ...mockAuthState.state,
          user: unverifiedUser,
          isAuthenticated: true,
        },
      };
      (useAuthState as jest.Mock).mockReturnValue(updatedAuthState);

      const { result } = renderHook(() => useTokenForgeAuth());
      const auth = result.current;

      expect(auth.canCreateToken).toBe(false);
      expect(auth.canUseServices).toBe(false);
    });
  });

  it('should handle network changes', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const newChainId = 1; // Ethereum Mainnet

    // Mise à jour du wallet state avec le nouveau chainId
    const updatedWalletState = {
      ...mockWalletState,
      state: {
        ...mockWalletState.state,
        chainId: newChainId,
        isCorrectNetwork: true,
      },
    };

    await act(async () => {
      mockWalletState.actions.handleNetworkChange(newChainId);
      (useWalletState as jest.Mock).mockReturnValue(updatedWalletState);
    });

    expect(mockWalletState.actions.handleNetworkChange).toHaveBeenCalledWith(newChainId);
    expect(result.current.chainId).toBe(newChainId);
    expect(result.current.isCorrectNetwork).toBe(true);
  });

  it('should handle account changes', async () => {
    const { result } = renderHook(() => useTokenForgeAuth());
    const newAddress = '0x123...';

    // Mise à jour du wallet state avec la nouvelle adresse
    const updatedWalletState = {
      ...mockWalletState,
      state: {
        ...mockWalletState.state,
        address: newAddress,
        isConnected: true,
      },
    };

    await act(async () => {
      mockWalletState.actions.handleAccountChange([newAddress]);
      (useWalletState as jest.Mock).mockReturnValue(updatedWalletState);
    });

    expect(mockWalletState.actions.handleAccountChange).toHaveBeenCalledWith([newAddress]);
    expect(result.current.address).toBe(newAddress);
    expect(result.current.isConnected).toBe(true);
  });
});
