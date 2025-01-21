import { renderHook, act } from '@testing-library/react-hooks';
import { useTokenForgeAuth } from '../useTokenForgeAuth';
import { useAuthState } from '../useAuthState';
import { useWalletState } from '../useWalletState';
import { useEmailVerification } from '../useEmailVerification';
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
vi.mock('../useAuthState');
vi.mock('../useWalletState');
vi.mock('../useEmailVerification');

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
      handleAuthStart: vi.fn(),
      handleAuthSuccess: vi.fn(),
      handleAuthError: vi.fn(),
      handleLogout: vi.fn(),
      handleEmailVerificationStart: vi.fn(),
      handleEmailVerificationSuccess: vi.fn(),
      handleEmailVerificationFailure: vi.fn(),
      handleUpdateUser: vi.fn(),
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
      handleConnect: vi.fn(),
      handleDisconnect: vi.fn(),
      handleNetworkChange: vi.fn(),
      handleAccountChange: vi.fn(),
    },
  };

  const mockEmailVerification = {
    sendVerificationEmail: vi.fn(),
    checkVerificationStatus: vi.fn(),
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
    (useAuthState as vi.Mock).mockReturnValue(mockAuthState);
    (useWalletState as vi.Mock).mockReturnValue(mockWalletState);
    (useEmailVerification as vi.Mock).mockReturnValue(mockEmailVerification);
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

    expect(mockAuthState.actions.handleAuthStart).toHaveBeenCalled();
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
    (useAuthState as vi.Mock).mockReturnValue(updatedAuthState);

    const { result } = renderHookWithProviders();

    await act(async () => {
      await result.current.verifyEmail(mockUser);
    });

    expect(mockEmailVerification.sendVerificationEmail).toHaveBeenCalled();
    expect(mockAuthState.actions.handleEmailVerificationStart).toHaveBeenCalled();
  });

  it('should handle logout', async () => {
    const { result } = renderHookWithProviders();

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
      (useAuthState as vi.Mock).mockReturnValue(updatedAuthState);

      const updatedWalletState = {
        ...mockWalletState,
        state: {
          ...mockWalletState.state,
          isConnected: true,
          isCorrectNetwork: true,
        },
      };
      (useWalletState as vi.Mock).mockReturnValue(updatedWalletState);

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
      (useAuthState as vi.Mock).mockReturnValue(updatedAuthState);

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
      (useAuthState as vi.Mock).mockReturnValue(updatedAuthState);

      const { result } = renderHookWithProviders();
      const auth = result.current;

      expect(auth.canCreateToken).toBe(false);
      expect(auth.canUseServices).toBe(false);
    });
  });

  it('should handle network changes', async () => {
    const { result } = renderHookWithProviders();
    const newChainId = 1; // Ethereum Mainnet

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
      (useWalletState as vi.Mock).mockReturnValue(updatedWalletState);
    });

    expect(mockWalletState.actions.handleNetworkChange).toHaveBeenCalledWith(newChainId);
    expect(result.current.chainId).toBe(newChainId);
    expect(result.current.isCorrectNetwork).toBe(true);
  });

  it('should handle account changes', async () => {
    const { result } = renderHookWithProviders();
    const newAddress = '0x123...';

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
      (useWalletState as vi.Mock).mockReturnValue(updatedWalletState);
    });

    expect(mockWalletState.actions.handleAccountChange).toHaveBeenCalledWith([newAddress]);
    expect(result.current.address).toBe(newAddress);
    expect(result.current.isConnected).toBe(true);
  });
});
