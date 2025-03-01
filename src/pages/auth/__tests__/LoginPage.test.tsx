import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { useTokenForgeAuth } from '../../../features/auth/hooks/useTokenForgeAuth';
import { useNavigate } from 'react-router-dom';
import { AuthError } from '../../../features/auth/errors/AuthError';
import { AuthErrorCode } from '../../../features/auth/errors/AuthError';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: () => ({
    state: { from: { pathname: '/' } }, // Valeur par défaut
  }),
  Link: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <a {...props}>{children}</a>, // Mock de Link
}));

vi.mock('../../../features/auth/hooks/useTokenForgeAuth', () => ({
  useTokenForgeAuth: vi.fn()
}));

describe('LoginPage', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      signIn: mockLogin,
      loading: false,
      error: null,
      isInitialized: true,
      dispatch: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      updateUser: vi.fn(),
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      clearError: vi.fn(),
      validateAdminAccess: vi.fn(),
      status: 'idle',
      isAuthenticated: false,
      user: null,
      wallet: { address: null, isConnected: false, isCorrectNetwork: false },
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    console.log(screen.debug()); // Log de l'état du DOM
    expect(screen.getAllByRole('textbox', { name: /email address/i }).length).toBe(1);
    expect(screen.getAllByRole('textbox', { name: /password/i }).length).toBe(1);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<LoginPage />);
    console.log(screen.debug()); // Log de l'état du DOM
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByRole('textbox', { name: /password/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      signIn: mockLogin,
      loading: true,
      error: null,
      isInitialized: true,
      dispatch: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      updateUser: vi.fn(),
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      clearError: vi.fn(),
      validateAdminAccess: vi.fn(),
      status: 'idle',
      isAuthenticated: false,
      user: null,
      wallet: { address: null, isConnected: false, isCorrectNetwork: false },
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
    });

    render(<LoginPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('displays error message when login fails', () => {
    const errorMessage = 'Invalid credentials';
    const mockError: AuthError = new AuthError(AuthErrorCode.INVALID_CREDENTIALS, errorMessage);
    vi.mocked(useTokenForgeAuth).mockReturnValue({
      signIn: mockLogin,
      loading: false,
      error: mockError,
      isInitialized: true,
      dispatch: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      updateUser: vi.fn(),
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      clearError: vi.fn(),
      validateAdminAccess: vi.fn(),
      status: 'idle',
      isAuthenticated: false,
      user: null,
      wallet: { address: null, isConnected: false, isCorrectNetwork: false },
      isAdmin: false,
      canCreateToken: false,
      canUseServices: false,
    });

    render(<LoginPage />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('navigates to dashboard after successful login', async () => {
    render(<LoginPage />);
    console.log(screen.debug()); // Log de l'état du DOM
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByRole('textbox', { name: /password/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});