import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../../features/auth';
import { tokenRoutes } from '../routes/token.routes';
import { adminRoutes } from '../routes/admin.routes';
import { dashboardRoutes } from '../routes/dashboard.routes';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
  usePublicClient: jest.fn(),
}));

describe('Protected Routes', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TokenForgeAuthProvider>
          <Routes>
            {[...tokenRoutes, ...adminRoutes, ...dashboardRoutes].map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </TokenForgeAuthProvider>
      </MemoryRouter>
    );
  };

  describe('Token Routes', () => {
    beforeEach(() => {
      (require('wagmi') as any).useAccount.mockReturnValue({ isConnected: false });
      (require('wagmi') as any).useNetwork.mockReturnValue({ chain: null });
    });

    it('redirects to connect wallet page when wallet is not connected', () => {
      renderWithRouter(['/tokens']);
      expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    });

    it('redirects to wrong network page when on incorrect network', () => {
      (require('wagmi') as any).useAccount.mockReturnValue({ isConnected: true });
      (require('wagmi') as any).useNetwork.mockReturnValue({ chain: { id: 999 } });
      
      renderWithRouter(['/tokens']);
      expect(screen.getByText('Wrong Network')).toBeInTheDocument();
    });

    it('shows token dashboard when all conditions are met', () => {
      (require('wagmi') as any).useAccount.mockReturnValue({ isConnected: true });
      (require('wagmi') as any).useNetwork.mockReturnValue({ chain: { id: 1 } });
      
      renderWithRouter(['/tokens']);
      expect(screen.getByText('Token Dashboard')).toBeInTheDocument();
    });
  });

  describe('Admin Routes', () => {
    beforeEach(() => {
      (require('wagmi') as any).useAccount.mockReturnValue({ isConnected: true });
      (require('wagmi') as any).useNetwork.mockReturnValue({ chain: { id: 1 } });
    });

    it('redirects to unauthorized page when user is not admin', () => {
      renderWithRouter(['/admin']);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('shows admin dashboard when user is admin', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'admin@tokenforge.com' },
      });
      
      renderWithRouter(['/admin']);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  describe('Dashboard Routes', () => {
    it('redirects to login when user is not authenticated', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });
      
      renderWithRouter(['/dashboard']);
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('shows dashboard when user is authenticated', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });
      
      renderWithRouter(['/dashboard']);
      expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });
  });
});
