import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { useTokenForgeAuthContext } from '../../providers/TokenForgeAuthProvider';
import { TokenForgeUser } from '../../types';
import { UserMetadata } from 'firebase/auth';
import { WagmiConfig, createConfig } from 'wagmi';
import { http, Chain } from 'viem';
import { FC, PropsWithChildren } from 'react';

// Configuration de la chaîne Ethereum pour les tests
const testChain = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://eth-mainnet.g.alchemy.com/v2'] },
    default: { http: ['https://eth-mainnet.g.alchemy.com/v2'] },
  },
} as const satisfies Chain;

// Configuration Wagmi pour les tests
const config = createConfig({
  chains: [testChain],
  transports: {
    [testChain.id]: http(),
  },
});

// Wrapper pour les providers
const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <WagmiConfig config={config}>
    {children}
  </WagmiConfig>
);

// Mocks
vi.mock('../../providers/TokenForgeAuthProvider');

describe('useTokenForgeAuth', () => {
  // Mock implementations
  const mockAuthState = {
    state: {
      status: 'idle',
      isAuthenticated: false,
      user: null,
      error: null,
      walletState: {
        isConnected: false,
        isCorrectNetwork: false,
        address: null,
        chainId: null,
        provider: null,
        walletClient: null,
      },
    },
    dispatch: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    connectWallet: vi.fn(),
    disconnectWallet: vi.fn(),
    clearError: vi.fn(),
    actions: {
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      updateNetwork: vi.fn(),
      updateProvider: vi.fn(),
    },
    validateAdminAccess: vi.fn(),
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
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    isAdmin: false,
    customMetadata: {},
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTokenForgeAuthContext).mockReturnValue(mockAuthState);
  });

  const renderHookWithProviders = () => {
    return renderHook(() => useTokenForgeAuth(), { wrapper: Wrapper });
  };

  it('should initialize with correct state', () => {
    const { result } = renderHookWithProviders();
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
    const { result } = renderHookWithProviders();
    const credentials = { email: 'test@example.com', password: 'password123' };

    await act(async () => {
      await result.current.login(credentials.email, credentials.password);
    });

    expect(mockAuthState.actions.login).toHaveBeenCalled();
  });

  it('should handle email verification', async () => {
    const mockUser = createMockUser({
      email: 'test@example.com',
      emailVerified: false,
    });

    const updatedAuthState = {
      ...mockAuthState,
      state: {
        ...mockAuthState.state,
        user: mockUser,
        isAuthenticated: true,
      },
    };
    vi.mocked(useTokenForgeAuthContext).mockReturnValue(updatedAuthState);

    const { result } = renderHookWithProviders();

    await act(async () => {
      await result.current.verifyEmail(mockUser);
    });

    expect(mockAuthState.actions.updateUser).toHaveBeenCalled();
  });

  it('should handle logout', async () => {
    const { result } = renderHookWithProviders();

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthState.actions.logout).toHaveBeenCalled();
    expect(mockAuthState.disconnectWallet).toHaveBeenCalled();
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
      vi.mocked(useTokenForgeAuthContext).mockReturnValue(updatedAuthState);

      const { result } = renderHookWithProviders();
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
      vi.mocked(useTokenForgeAuthContext).mockReturnValue(updatedAuthState);

      const { result } = renderHookWithProviders();
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
      vi.mocked(useTokenForgeAuthContext).mockReturnValue(updatedAuthState);

      const { result } = renderHookWithProviders();
      const auth = result.current;

      expect(auth.canCreateToken).toBe(false);
      expect(auth.canUseServices).toBe(false);
    });
  });

  it('should handle wallet connection', async () => {
    const mockWalletState = {
      isConnected: true,
      isCorrectNetwork: true,
      address: '0x123',
      chainId: 1,
      provider: {},
      walletClient: {},
    };

    const { result } = renderHookWithProviders();

    expect(result.current.walletState.isConnected).toBe(false);

    // Update wallet state
    vi.mocked(useTokenForgeAuthContext).mockReturnValue({
      ...vi.mocked(useTokenForgeAuthContext)(),
      state: {
        ...vi.mocked(useTokenForgeAuthContext)().state,
        walletState: mockWalletState,
      },
    });

    expect(result.current.walletState.isConnected).toBe(true);
    expect(result.current.walletState.address).toBe('0x123');
  });

  it('should handle network changes', async () => {
    const { result } = renderHookWithProviders();
    const newChainId = 1; // Ethereum Mainnet

    const updatedWalletState = {
      isConnected: true,
      isCorrectNetwork: true,
      address: '0x123',
      chainId: newChainId,
      provider: {},
      walletClient: {},
    };

    // Update wallet state
    vi.mocked(useTokenForgeAuthContext).mockReturnValue({
      ...vi.mocked(useTokenForgeAuthContext)(),
      state: {
        ...vi.mocked(useTokenForgeAuthContext)().state,
        walletState: updatedWalletState,
      },
    });

    expect(result.current.chainId).toBe(newChainId);
    expect(result.current.isCorrectNetwork).toBe(true);
  });

  it('should handle account changes', async () => {
    const { result } = renderHookWithProviders();
    const newAddress = '0x123...';

    const updatedWalletState = {
      isConnected: true,
      isCorrectNetwork: true,
      address: newAddress,
      chainId: 1,
      provider: {},
      walletClient: {},
    };

    // Update wallet state
    vi.mocked(useTokenForgeAuthContext).mockReturnValue({
      ...vi.mocked(useTokenForgeAuthContext)(),
      state: {
        ...vi.mocked(useTokenForgeAuthContext)().state,
        walletState: updatedWalletState,
      },
    });

    expect(result.current.address).toBe(newAddress);
    expect(result.current.isConnected).toBe(true);
  });
});
