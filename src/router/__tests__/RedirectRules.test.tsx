import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TokenForgeAuthProvider } from '../../features/auth';
import { publicRoutes } from '../routes/public.routes';
import { authRoutes } from '../routes/auth.routes';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('Redirect Rules', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TokenForgeAuthProvider>
          <Routes>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            {authRoutes.map((route) => (
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

  describe('Authentication Pages', () => {
    it('redirects from login to home when already authenticated', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });
      
      renderWithRouter(['/login']);
      expect(screen.getByText('Welcome to TokenForge')).toBeInTheDocument();
    });

    it('redirects from signup to home when already authenticated', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: { email: 'user@example.com' },
      });
      
      renderWithRouter(['/signup']);
      expect(screen.getByText('Welcome to TokenForge')).toBeInTheDocument();
    });

    it('shows login page when not authenticated', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });
      
      renderWithRouter(['/login']);
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    it('allows access to home page without authentication', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });
      
      renderWithRouter(['/']);
      expect(screen.getByText('Welcome to TokenForge')).toBeInTheDocument();
    });

    it('allows access to about page without authentication', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });
      
      renderWithRouter(['/about']);
      expect(screen.getByText('About TokenForge')).toBeInTheDocument();
    });

    it('allows access to contact page without authentication', () => {
      (require('firebase/auth') as any).getAuth.mockReturnValue({
        currentUser: null,
      });
      
      renderWithRouter(['/contact']);
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
  });
});
