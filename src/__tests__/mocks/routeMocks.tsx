import React from 'react';
import { vi } from 'vitest';
import type { TokenForgeAuthContextValue, TokenForgeUser, TokenForgeAuthState, AuthStatus, WalletState } from '../../features/auth/types/auth';

// Mock des composants Material-UI
vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Paper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CircularProgress: () => <div>Loading...</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Menu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IconButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AppBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Toolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Drawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ListItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ListItemIcon: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ListItemText: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Divider: () => <hr />,
  useMediaQuery: () => false,
  useTheme: () => ({ 
    breakpoints: { down: () => false },
    palette: {
      mode: 'dark',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
  }),
  styled: (Component: any) => Component,
  alpha: () => 'rgba(0,0,0,0.5)',
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  createTheme: () => ({
    palette: {
      mode: 'dark',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    },
    breakpoints: {
      down: () => false
    }
  })
}));

// Mock du Layout
vi.mock('@/layouts/Layout', () => {
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <div data-testid="navbar">Navbar</div>
      <div data-testid="main">{children}</div>
    </div>
  );
  Layout.displayName = 'Layout';
  return { Layout, NAVBAR_HEIGHT: 64 };
});

// Mock des composants de pages
const mockPages = {
  Home: () => <div>Home Page</div>,
  Dashboard: () => <div>Dashboard Page</div>,
  Profile: () => <div>Profile Page</div>,
  Login: () => <div>Auth Page</div>,
  NotFound: () => <div>Not Found Page</div>,
  Documentation: () => <div>Documentation Page</div>,
  CreateToken: () => <div>Create Token Page</div>,
  TokenList: () => <div>Tokens Page</div>,
  TokenDetails: () => <div>Token Details Page</div>,
  Services: () => <div>Services Page</div>,
  Staking: () => <div>Staking Page</div>,
  Plans: () => <div>Plans Page</div>,
  Admin: () => <div>Admin Page</div>,
  AdminUsers: () => <div>Users Page</div>,
  AdminTokens: () => <div>Tokens Page</div>,
  AdminSettings: () => <div>Settings Page</div>,
  ServiceConfig: () => <div>Config Page</div>
};

// Mock des pages
Object.entries(mockPages).forEach(([name, component]) => {
  vi.mock(`@/pages/${name}`, () => ({
    default: component,
    [`${name}Page`]: component
  }));
});

// Mock des guards
vi.mock('@/features/auth/guards/AuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/features/auth/guards/PublicGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/features/auth/guards/AdminGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock des providers Web3
vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ConnectButton: () => <div>Connect Wallet</div>,
  darkTheme: () => ({}),
  connectorsForWallets: () => [],
  wallet: {
    metaMask: () => ({}),
    walletConnect: () => ({}),
    coinbase: () => ({}),
    trust: () => ({})
  }
}));

vi.mock('wagmi', () => ({
  WagmiConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAccount: () => ({ isConnected: true }),
  useConnect: () => ({ connect: vi.fn(), connectors: [] })
}));

// Mock du Web3Providers
vi.mock('../../providers/web3/Web3Providers', () => ({
  Web3Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Export des mocks pour les tests
export const mockUser: TokenForgeUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  displayName: 'Test User',
  isAdmin: false,
  canCreateToken: true,
  canUseServices: true,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
    lastLoginTime: Date.now(),
    walletAddress: '0x123',
    chainId: 1,
    customMetadata: {}
  }
};

export const mockAuthContext: TokenForgeAuthContextValue = {
  isInitialized: true,
  isAuthenticated: true,
  loading: false,
  user: mockUser,
  status: 'authenticated' as AuthStatus,
  error: null,
  wallet: {
    address: '0x123' as `0x${string}`,
    isConnected: true,
    chainId: 1,
    isCorrectNetwork: true,
    walletClient: undefined
  } as WalletState,
  isAdmin: false,
  canCreateToken: true,
  canUseServices: true,
  dispatch: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  updateUser: vi.fn(),
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
  clearError: vi.fn(),
  validateAdminAccess: vi.fn()
}; 