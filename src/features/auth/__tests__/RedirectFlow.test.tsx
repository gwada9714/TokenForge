import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../context';
import { publicRoutes } from '../../../router/routes/public.routes';
import { authRoutes } from '../../../router/routes/auth.routes';
import { tokenRoutes } from '../../../router/routes/token.routes';
import { adminRoutes } from '../../../router/routes/admin.routes';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Wagmi
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useNetwork: jest.fn(),
}));

describe('Redirect Flow', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    const allRoutes = [
      ...Object.values(publicRoutes),
      ...Object.values(authRoutes),
      ...Object.values(tokenRoutes),
      ...Object.values(adminRoutes)
    ];

    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <TokenForgeAuthProvider>
          <Routes>
            {allRoutes.map((route) => (
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

  describe('Public Routes', () => {
    it('allows access to public routes without authentication', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });

      renderWithRouter(['/']);
      expect(screen.getByText('Welcome to TokenForge')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('redirects to login from protected routes when not authenticated', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });

      renderWithRouter(['/dashboard']);

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });

    it('redirects to connect wallet page when wallet is required but not connected', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: false,
      });

      renderWithRouter(['/tokens']);

      await waitFor(() => {
        expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
      });
    });

    it('redirects to wrong network page when on incorrect network', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });
      (require('wagmi') as any).useAccount.mockReturnValue({
        isConnected: true,
      });
      (require('wagmi') as any).useNetwork.mockReturnValue({
        chain: { id: 1 }, // Wrong network (Ethereum instead of BSC)
      });

      renderWithRouter(['/tokens']);

      await waitFor(() => {
        expect(screen.getByText('Wrong Network')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Routes', () => {
    it('redirects to unauthorized page when user is not admin', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com', isAdmin: false },
      });

      renderWithRouter(['/admin']);

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('allows access to admin routes for admin users', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'admin@example.com', isAdmin: true },
      });

      renderWithRouter(['/admin']);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Routes', () => {
    it('redirects to dashboard when accessing login while authenticated', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });

      renderWithRouter(['/login']);

      await waitFor(() => {
        expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      });
    });

    it('redirects to dashboard when accessing signup while authenticated', async () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });

      renderWithRouter(['/signup']);

      await waitFor(() => {
        expect(screen.getByText('User Dashboard')).toBeInTheDocument();
      });
    });
  });
});
