import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../header';
import { TokenForgeAuthProvider } from '../../../features/auth';

// Mock hooks
vi.mock('@/features/auth', () => ({
  ...vi.importActual('@/features/auth'),
  useTokenForgeAuth: vi.fn(),
}));

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

describe('Header', () => {
  const mockNavigate = vi.fn();
  
  // Mock useNavigate
  vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
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

      expect(screen.getByText('À propos')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
      expect(screen.getByText('Marketplace')).toBeTruthy();
      expect(screen.queryByText('Dashboard')).toBeFalsy();
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

      expect(screen.getByText('Dashboard')).toBeTruthy();
      expect(screen.getByText('Mes Tokens')).toBeTruthy();
      expect(screen.queryByText('À propos')).toBeFalsy();
    });

    it('shows admin link when user is admin', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'admin@example.com', isAdmin: true },
      });

      renderHeader();

      expect(screen.getByText('Admin')).toBeTruthy();
    });
  });

  describe('Authentication Buttons', () => {
    it('shows login button when not authenticated', () => {
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderHeader();

      expect(screen.getByText('Connexion')).toBeTruthy();
      expect(screen.queryByText('Déconnexion')).toBeFalsy();
    });

    it('shows logout button when authenticated', () => {
      const mockSignOut = vi.fn();
      (require('@/features/auth') as any).useTokenForgeAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'user@example.com' },
        signOut: mockSignOut,
      });

      renderHeader();

      const logoutButton = screen.getByText('Déconnexion');
      expect(logoutButton).toBeTruthy();
      
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

      expect(screen.getByText('Connecter Wallet')).toBeTruthy();
    });

    it('hides connect wallet button when wallet is connected', () => {
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: true,
      });

      renderHeader();

      expect(screen.queryByText('Connecter Wallet')).toBeFalsy();
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
