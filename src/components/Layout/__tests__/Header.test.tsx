import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../header';
import { TokenForgeAuthProvider } from '../../../features/auth';

// Mock hooks
jest.mock('@/features/auth', () => ({
  ...jest.requireActual('@/features/auth'),
  useTokenForgeAuth: jest.fn(),
}));

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}));

describe('Header', () => {
  const mockNavigate = jest.fn();
  
  // Mock useNavigate
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <TokenForgeAuthProvider>
          <Header />
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );
  };

  describe('Navigation Links', () => {
    it('shows public links when not authenticated', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: false,
      });

      renderHeader();

      expect(screen.getByText('À propos')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('shows authenticated links when logged in', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'user@example.com' },
      });
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: true,
      });

      renderHeader();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Mes Tokens')).toBeInTheDocument();
      expect(screen.queryByText('À propos')).not.toBeInTheDocument();
    });

    it('shows admin link when user is admin', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'admin@example.com', isAdmin: true },
      });

      renderHeader();

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Authentication Buttons', () => {
    it('shows login button when not authenticated', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderHeader();

      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument();
    });

    it('shows logout button when authenticated', () => {
      const mockSignOut = jest.fn();
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'user@example.com' },
        signOut: mockSignOut,
      });

      renderHeader();

      const logoutButton = screen.getByText('Déconnexion');
      expect(logoutButton).toBeInTheDocument();
      
      fireEvent.click(logoutButton);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Wallet Connection', () => {
    it('shows connect wallet button when wallet not connected', () => {
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: false,
      });

      renderHeader();

      expect(screen.getByText('Connecter Wallet')).toBeInTheDocument();
    });

    it('hides connect wallet button when wallet is connected', () => {
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: true,
      });

      renderHeader();

      expect(screen.queryByText('Connecter Wallet')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when button is clicked', () => {
      renderHeader();

      const menuButton = screen.getByText('☰');
      fireEvent.click(menuButton);

      // Verify menu items are visible
      const mobileMenu = document.querySelector('[data-testid="mobile-menu"]');
      expect(mobileMenu).toHaveStyle({ display: 'block' });

      // Click again to close
      fireEvent.click(menuButton);
      expect(mobileMenu).toHaveStyle({ display: 'none' });
    });
  });
});
